import React from "react";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Box, Cone, Cylinder, Edges, Line, Sphere } from "@react-three/drei";
import {
  Group, Mesh, MeshBasicMaterial, MeshPhongMaterial,
} from "./components";
import { Config } from "./config";
import {
  get3DPositionFunc, getGardenPositionFunc,
  zZero,
} from "./helpers";
import {
  rolloverRotation, sceneObjectBody, SceneObjectFormValues,
} from "../scene_objects/interfaces";
import { edit, init, save } from "../api/crud";
import { Path } from "../internal_urls";
import { ASSETS, BigDistance } from "./constants";
import { useTextureVariant } from "./texture_variants";
import { PottedPlant } from "./scenes/props/potted_plant";
import { StarterTray } from "./scenes/props/starter_tray";
import {
  CatmullRomCurve3, Group as ThreeGroup, Material, Object3D, Vector3,
  DoubleSide,
} from "three";
import { SpecialStatus, TaggedResource, TaggedSceneObject } from "farmbot";
import { ThreeDObjectSelection } from "./selection_types";
import {
  GREENHOUSE_SCENE_OBJECTS,
  LAB_SCENE_OBJECTS,
  OUTDOOR_SCENE_OBJECTS,
} from "./scenes";
import { Actions } from "../constants";
import { Astronaut, Desk, Fence, GreenhouseWall, Hab, Laptop, Rover, Tree } from "./scenes/props";
import { noop, range } from "lodash";
import { setFocusedSceneObjectField } from "../scene_objects/actions";
import { round as snapToGrid } from "../farm_designer/map/util";
import type { DesignerState } from "../farm_designer/interfaces";
import { SceneObject } from "farmbot/dist/resources/api_resources";
import { Solar } from "./garden/solar";
import { clickWasDragged } from "./click_event";
import { MARS_SCENE_OBJECTS } from "./scenes/scene_object_data";
import {
  axisConstraint, ControlArrow, ControlDragEvent, ControlHandle, ControlLabel,
  CONTROL_ARROW_WIDTH, CONTROL_RENDER_ORDER, CONTROL_SIZE_ARROW_WIDTH,
  ControlSphere, noControlRaycast, planeConstraint,
  pointerRayPointAtZ as controlPointerRayPointAtZ,
  stopControlDragEvent, stopControlEvent,
} from "./controls";

const EDGE_LINE_WIDTH = 4;
const PREVIEW_MARKER_RADIUS = 75;
const MARKER_RADIUS = 35;
const ORIGIN_MARKER_RADIUS = 20;
const ORIGIN_LABEL_SIZE = 32;
const ORIGIN_PLANE_THICKNESS = 2;
const ORIGIN_SPHERE_RENDER_ORDER = CONTROL_RENDER_ORDER;
const ORIGIN_MARKER_RENDER_ORDER = ORIGIN_SPHERE_RENDER_ORDER + 1;
const OBJECT_AXIS_RENDER_ORDER = ORIGIN_MARKER_RENDER_ORDER + 1;
const FACE_SIZE_RENDER_ORDER = OBJECT_AXIS_RENDER_ORDER + 1;
const FACE_MARKER_RENDER_ORDER = FACE_SIZE_RENDER_ORDER + 1;
const FACE_SIZE_ARROW_LENGTH = 250;
const FACE_SIZE_LABEL_SIZE = ORIGIN_LABEL_SIZE;
const OBJECT_AXIS_ARROW_LENGTH = 125;
const ROTATION_CONTROL_SPACING = 100;
const ROTATION_CONTROL_ARC = Math.PI / 3;
const ROTATION_CONTROL_MAX_LENGTH = 1000;
const ROTATION_CONTROL_SEGMENTS = 16;
const ROTATION_CONTROL_WIDTH = CONTROL_SIZE_ARROW_WIDTH;
const ROTATION_CONTROL_HEAD_LENGTH = ROTATION_CONTROL_WIDTH * 3;
const ROTATION_CONTROL_HEAD_RADIUS = ROTATION_CONTROL_WIDTH;
const ROTATION_GUIDE_EXTENSION = 250;
const ROTATION_SNAP_INCREMENT = 5;
const ROTATION_ORTHO_SNAP_RANGE = ROTATION_SNAP_INCREMENT * 1;
const BASE_OBJECT_MARKER_CAMERA_DISTANCE = 3500;
const MAX_OBJECT_MARKER_SCALE = 4;

interface SceneObjectCursor {
  x: number;
  y: number;
  z: number;
}

type XYZRecord = Record<"x" | "y" | "z", number>;

export const sceneObjectRotation = (
  rotation: number,
): [number, number, number] => [0, 0, rotation * Math.PI / 180];

export const rotatePointAboutZ = (
  point: XYZRecord,
  pivot: XYZRecord,
  radians: number,
): XYZRecord => {
  const x = point.x - pivot.x;
  const y = point.y - pivot.y;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: pivot.x + x * cos - y * sin,
    y: pivot.y + x * sin + y * cos,
    z: point.z,
  };
};

export interface SceneObjectBounds {
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
}

interface SceneObjectDraft {
  center?: SceneObjectCursor;
  rotation?: number;
  corner?: SceneObjectCursor;
  heightStartY?: number;
}

interface SceneObjectPlacementProps {
  config: Config;
  enabled: boolean;
  navigate(path: string): void;
  dispatch?: Function;
  sceneObjects?: TaggedSceneObject[];
  drawnSceneObject?: SceneObjectFormValues;
}

const eventScreenY = (e: ThreeEvent<MouseEvent | PointerEvent>) =>
  e.nativeEvent.clientY;

const snapSceneObjectSize = (value: number) =>
  Math.max(1, snapToGrid(value));

export const unifiedSizeUpdate = (
  unified: boolean | undefined,
  size: number,
) =>
  unified
    ? { x_size: size, y_size: size, z_size: size }
    : {};

const sceneObjectSizeFields = {
  x: "x_size",
  y: "y_size",
  z: "z_size",
} as const;

export const placementAxisSize = (
  sceneObject: SceneObjectFormValues,
  axis: "x" | "y" | "z",
  placementSize: number,
): number =>
  sceneObject.preserve_axes?.includes(axis)
    ? sceneObject[sceneObjectSizeFields[axis]]
    : placementSize;

const preservesPlacementAxis = (
  sceneObject: SceneObjectFormValues,
  axis: "x" | "y" | "z",
) => !!sceneObject.preserve_axes?.includes(axis);

const preservesFootprint = (sceneObject: SceneObjectFormValues) =>
  preservesPlacementAxis(sceneObject, "x")
  && preservesPlacementAxis(sceneObject, "y");

const preservesRotation = (sceneObject: SceneObjectFormValues) =>
  !!sceneObject.preserve_axes?.includes("r");

const usesPlacementScale = (sceneObject: SceneObjectFormValues) =>
  sceneObject.shape == "solar"
  || (sceneObject.preserve_axes?.length == 3
    && preservesFootprint(sceneObject)
    && preservesRotation(sceneObject));

export const scaledPlacementSize = (
  sceneObject: SceneObjectFormValues,
  height: number,
) => {
  const zSize = Math.max(1, Math.round(height));
  const scale = zSize / Math.max(1, sceneObject.z_size);
  return {
    x_size: Math.max(1, Math.round(sceneObject.x_size * scale)),
    y_size: Math.max(1, Math.round(sceneObject.y_size * scale)),
    z_size: zSize,
  };
};

const hasTranslucentPlacementPreview = (
  sceneObject: SceneObjectFormValues,
) => sceneObject.preserve_axes !== undefined;

const placementPreviewAxisSize = (
  sceneObject: SceneObjectFormValues | undefined,
  axis: "x" | "y" | "z",
  placementSize: number,
  rotating: boolean,
) => {
  if (!sceneObject) { return placementSize; }
  if (rotating) {
    return sceneObject[sceneObjectSizeFields[axis]] ?? placementSize;
  }
  return placementAxisSize(sceneObject, axis, placementSize);
};

export const heightFromPointerRay = (
  e: ThreeEvent<MouseEvent | PointerEvent>,
  base: { x: number, y: number, z: number },
) => {
  if (!e.ray) { return undefined; }
  const { origin, direction } = e.ray;
  const horizontalDirection = new Vector3(direction.x, direction.y, 0);
  const horizontalLengthSq = horizontalDirection.lengthSq();
  if (horizontalLengthSq < 0.000001) { return undefined; }
  const horizontalOffset = new Vector3(
    base.x - origin.x,
    base.y - origin.y,
    0,
  );
  const rayDistance = horizontalOffset.dot(horizontalDirection)
    / horizontalLengthSq;
  if (rayDistance < 0) { return undefined; }
  return Math.max(1, Math.round(
    origin.z + direction.z * rayDistance - base.z));
};

const sceneObjectTopResizeHeight = (
  e: ThreeEvent<PointerEvent>,
  config: Config,
  center: { x: number, y: number },
  sceneObject: TaggedSceneObject,
) => {
  const basePosition = get3DPositionFunc(config)(center);
  const groundZ = -config.bedZOffset - config.bedHeight;
  const objectCenter = reCenter(config, sceneObject);
  return heightFromPointerRay(e, {
    x: basePosition.x,
    y: basePosition.y,
    z: groundZ + objectCenter.z,
  });
};

export const sceneObjectTopResizeUpdate = (
  e: ThreeEvent<PointerEvent>,
  config: Config,
  center: { x: number, y: number },
  sceneObject: TaggedSceneObject,
  pointerOffset = 0,
) => {
  e.stopPropagation();
  const height = sceneObjectTopResizeHeight(
    e, config, center, sceneObject);
  const adjustedHeight = height === undefined
    ? undefined
    : height + pointerOffset;
  return {
    z_size: adjustedHeight !== undefined
      ? snapSceneObjectSize(Math.max(1, adjustedHeight))
      : sceneObject.body.z_size,
  };
};

interface TopResizeMarkerHandlerProps {
  config: Config;
  center: { x: number, y: number };
  sceneObject: TaggedSceneObject;
  onPreview(update: Partial<TaggedSceneObject["body"]>): void;
  updateSceneObject(update: Partial<TaggedSceneObject["body"]>): void;
  onPreviewEnd(): void;
}

export const topResizeMarkerHandlers = (
  props: TopResizeMarkerHandlerProps,
) => ({
  onPointerMove: (e: ThreeEvent<PointerEvent>) =>
    props.onPreview(sceneObjectTopResizeUpdate(
      e, props.config, props.center, props.sceneObject)),
  onPointerUp: (e: ThreeEvent<PointerEvent>) => {
    props.updateSceneObject(sceneObjectTopResizeUpdate(
      e, props.config, props.center, props.sceneObject));
    props.onPreviewEnd();
  },
});

export const pointerRayPointAtZ = controlPointerRayPointAtZ;

const XYZ_UNIT = new Vector3(1, 1, 1).normalize();

const pointerRayParameterOnLine = (
  e: ThreeEvent<MouseEvent | PointerEvent>,
  linePoint: XYZRecord,
  lineDirection = XYZ_UNIT,
) => {
  const point = new Vector3(linePoint.x, linePoint.y, linePoint.z);
  const pointerParameter = () => {
    const pointer = e.point || point;
    return new Vector3().subVectors(pointer, point).dot(lineDirection);
  };
  if (!e.ray) {
    return pointerParameter();
  }
  const rayDirection = e.ray.direction.clone().normalize();
  const w0 = new Vector3().subVectors(point, e.ray.origin);
  const b = lineDirection.dot(rayDirection);
  const d = lineDirection.dot(w0);
  const rayDot = rayDirection.dot(w0);
  const denominator = 1 - b * b;
  if (Math.abs(denominator) < 0.000001) { return pointerParameter(); }
  return (b * rayDot - d) / denominator;
};

export const sceneObjectCornersFromCenter = (
  center: SceneObjectCursor,
  corner: SceneObjectCursor,
  rotation = 0,
) => {
  const localCorner = rotatePointAboutZ(
    corner, center, -sceneObjectRotation(rotation)[2]);
  const widthX = Math.abs(localCorner.x - center.x);
  const widthY = Math.abs(localCorner.y - center.y);
  return {
    x_0: Math.round(center.x - widthX),
    y_0: Math.round(center.y - widthY),
    z_0: Math.round(center.z),
    x_1: Math.round(center.x + widthX),
    y_1: Math.round(center.y + widthY),
  };
};

export const snapSceneObjectRotation = (rotation: number) => {
  const orthogonalRotation = Math.round(rotation / 90) * 90;
  const closeToOrthogonal =
    Math.abs(rotation - orthogonalRotation) <= ROTATION_ORTHO_SNAP_RANGE;
  const snappedRotation = closeToOrthogonal
    ? orthogonalRotation
    : Math.round(rotation / ROTATION_SNAP_INCREMENT)
    * ROTATION_SNAP_INCREMENT;
  return rolloverRotation(snappedRotation);
};

export const sceneObjectPlacementRotation = (
  center: SceneObjectCursor,
  cursor: SceneObjectCursor,
  fallback = 0,
) => {
  const x = cursor.x - center.x;
  const y = cursor.y - center.y;
  if (x == 0 && y == 0) { return fallback; }
  const degrees = Math.atan2(y, x) * 180 / Math.PI;
  const rotation = snapSceneObjectRotation(degrees);
  return rotation == 0 ? 0 : rotation;
};

export const sceneObjectRotationGuideVisible = (rotation: number) =>
  Math.abs(rotation % 90) < 0.001;

export const sceneObjectRotationGuidePoints = (
  center: XYZRecord,
  xSize: number,
  ySize: number,
  rotation: number,
): [[number, number, number], [number, number, number]] => {
  const halfLength = Math.max(xSize, ySize) / 2
    + ROTATION_GUIDE_EXTENSION;
  const radians = sceneObjectRotation(rotation)[2];
  const x = Math.cos(radians) * halfLength;
  const y = Math.sin(radians) * halfLength;
  return [
    [center.x - x, center.y - y, center.z],
    [center.x + x, center.y + y, center.z],
  ];
};

const boundsFromSceneObject = (sceneObject: TaggedSceneObject, config: Config):
  SceneObjectBounds => {
  const { x_size, y_size, z_size } = sceneObject.body;
  const center = reCenter(config, sceneObject);
  return {
    x0: center.x - x_size / 2,
    y0: center.y - y_size / 2,
    z0: center.z,
    x1: center.x + x_size / 2,
    y1: center.y + y_size / 2,
    z1: center.z + z_size,
  };
};

const sceneObjectNumber = (name: string) => {
  const match = name.match(/^Scene Object (\d+)$/);
  return match ? parseInt(match[1]) : 0;
};

const sizeFromCenterAndCorner = (
  center: SceneObjectCursor,
  corner: SceneObjectCursor,
  rotation: number,
) => {
  const bounds = sceneObjectCornersFromCenter(center, corner, rotation);
  return {
    x_size: Math.max(1, bounds.x_1 - bounds.x_0),
    y_size: Math.max(1, bounds.y_1 - bounds.y_0),
  };
};

export const nextSceneObjectName = (
  sceneObjects: TaggedSceneObject[] | undefined,
  createdNames: string[],
) => {
  const names = [
    ...(sceneObjects || []).map(sceneObject => sceneObject.body.name),
    ...createdNames,
  ];
  const maxNumber = Math.max(0, ...names.map(sceneObjectNumber));
  return `Scene Object ${maxNumber + 1}`;
};

export const useSceneObjectPlacement = (props: SceneObjectPlacementProps) => {
  const navigate = props.navigate;
  const [cursor, setCursor] = React.useState<SceneObjectCursor>();
  const [draft, setDraft] = React.useState<SceneObjectDraft>({});
  const wasEnabled = React.useRef(false);
  const createdNames = React.useRef<string[]>([]);
  const drawnSceneObjectRef = React.useRef(props.drawnSceneObject);
  React.useEffect(() => {
    drawnSceneObjectRef.current = props.drawnSceneObject;
  }, [props.drawnSceneObject]);
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(props.config),
    [props.config]);
  const get3DPosition = React.useMemo(
    () => get3DPositionFunc(props.config),
    [props.config]);

  const resetPlacement = React.useCallback(() => {
    setCursor(undefined);
    setDraft({});
  }, []);

  React.useEffect(() => {
    if (props.enabled && !wasEnabled.current) {
      resetPlacement();
    }
    wasEnabled.current = props.enabled;
  }, [props.enabled, resetPlacement]);

  // eslint-disable-next-line complexity
  const onPointerMove = React.useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!props.enabled) { return; }
    const drawnSceneObject = drawnSceneObjectRef.current;
    const center = draft.center
      ? { x: draft.center.x, y: draft.center.y }
      : undefined;
    const originZ = drawnSceneObject
      ? reCenter(props.config, {
        body: { ...drawnSceneObject, x_center: 0, y_center: 0 },
      } as TaggedSceneObject).z
      : 0;
    const groundZ = -props.config.bedZOffset - props.config.bedHeight;
    const pointerPlaneZ = groundZ + (draft.center?.z || originZ);
    const gardenPosition = getGardenPosition(pointerRayPointAtZ(e, pointerPlaneZ));
    const basePosition = center && get3DPosition(center);
    const objectGroundZ = groundZ + (draft.center?.z || 0);
    const rayHeight = basePosition && heightFromPointerRay(e, {
      x: basePosition.x,
      y: basePosition.y,
      z: objectGroundZ,
    });
    const fallbackHeight = Math.max(1, Math.round(
      ((draft.heightStartY || eventScreenY(e)) - eventScreenY(e)) * 2));
    setCursor({
      x: gardenPosition.x,
      y: gardenPosition.y,
      z: draft.corner
        ? (draft.center?.z || 0) + (rayHeight || fallbackHeight)
        : draft.center?.z || originZ,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draft.center,
    draft.corner,
    draft.heightStartY,
    get3DPosition,
    getGardenPosition,
    props.config.bedHeight,
    props.config.bedZOffset,
    props.enabled,
  ]);

  const { dispatch, enabled } = props;
  const updateDrawnSceneObject = React.useCallback((
    update: Partial<SceneObjectFormValues>,
  ) => {
    const drawnSceneObject = drawnSceneObjectRef.current;
    if (!dispatch || !drawnSceneObject) { return; }
    const payload = { ...drawnSceneObject, ...update };
    drawnSceneObjectRef.current = payload;
    dispatch({
      type: Actions.SET_DRAWN_SCENE_OBJECT_DATA,
      payload,
    });
  }, [dispatch]);
  const saveSceneObject = React.useCallback((
    center: SceneObjectCursor,
    corner: SceneObjectCursor,
    height: number,
    rotation?: number,
  ) => {
    if (!dispatch) { return; }
    const drawnSceneObject = drawnSceneObjectRef.current;
    if (!drawnSceneObject) { return; }
    const name = drawnSceneObject.name ||
      nextSceneObjectName(props.sceneObjects, createdNames.current);
    const c = adjustCenter(props.config, drawnSceneObject, center);
    const footprint = sizeFromCenterAndCorner(
      center, corner, drawnSceneObject.rotation);
    const scaledSize = usesPlacementScale(drawnSceneObject)
      ? scaledPlacementSize(
        drawnSceneObject, Math.max(1, height - center.z))
      : undefined;
    const body: SceneObject = {
      ...sceneObjectBody(drawnSceneObject),
      name,
      x_center: c.x,
      y_center: c.y,
      z_base: c.z,
      x_size: scaledSize?.x_size ?? placementAxisSize(
        drawnSceneObject, "x", footprint.x_size),
      y_size: scaledSize?.y_size ?? placementAxisSize(
        drawnSceneObject, "y", footprint.y_size),
      z_size: scaledSize?.z_size ?? placementAxisSize(
        drawnSceneObject, "z",
        Math.max(1, Math.round(height - center.z))),
      rotation: rotation ?? drawnSceneObject.rotation,
    };
    const action = init("SceneObject", body);
    createdNames.current.push(name);
    dispatch(action);
    dispatch(save(action.payload.uuid))
      .then(() => navigate(Path.sceneObjects()))
      .catch(noop);
  }, [
    dispatch,
    navigate,
    props.sceneObjects,
    props.config,
  ]);

  // eslint-disable-next-line complexity
  const onClick = React.useCallback((e: ThreeEvent<MouseEvent>) => {
    const drawnSceneObject = drawnSceneObjectRef.current;
    if (!enabled || !cursor || !drawnSceneObject || clickWasDragged(e)) {
      return;
    }
    e.stopPropagation();
    if (!draft.center) {
      const zCenter = reCenter(props.config, {
        body: { ...drawnSceneObject, x_center: 0, y_center: 0 },
      } as TaggedSceneObject).z;
      const center = { ...cursor, z: zCenter };
      const c = adjustCenter(props.config, drawnSceneObject, center);
      updateDrawnSceneObject({
        x_center: cursor.x,
        y_center: cursor.y,
        z_base: c.z,
      });
      if (preservesRotation(drawnSceneObject)
        || !hasTranslucentPlacementPreview(drawnSceneObject)) {
        const rotation = drawnSceneObject.rotation;
        if (usesPlacementScale(drawnSceneObject)) {
          setDraft({
            center,
            rotation,
            corner: center,
            heightStartY: eventScreenY(e),
          });
          return;
        }
        if (!preservesFootprint(drawnSceneObject)) {
          setDraft({ center, rotation });
          return;
        }
        if (preservesPlacementAxis(drawnSceneObject, "z")) {
          saveSceneObject(center, center, center.z, rotation);
          resetPlacement();
          return;
        }
        setDraft({
          center,
          rotation,
          corner: center,
          heightStartY: eventScreenY(e),
        });
        return;
      }
      setDraft({ center });
      return;
    }
    if (draft.rotation === undefined) {
      const rotation = sceneObjectPlacementRotation(
        draft.center, cursor, drawnSceneObject.rotation);
      updateDrawnSceneObject({ rotation });
      if (usesPlacementScale(drawnSceneObject)) {
        setDraft({
          ...draft,
          rotation,
          corner: draft.center,
          heightStartY: eventScreenY(e),
        });
        return;
      }
      if (!preservesFootprint(drawnSceneObject)) {
        setDraft({ ...draft, rotation });
        return;
      }
      if (preservesPlacementAxis(drawnSceneObject, "z")) {
        saveSceneObject(
          draft.center, draft.center, draft.center.z, rotation);
        resetPlacement();
        return;
      }
      setDraft({
        ...draft,
        rotation,
        corner: draft.center,
        heightStartY: eventScreenY(e),
      });
      return;
    }
    if (!draft.corner) {
      const bounds = sceneObjectCornersFromCenter(
        draft.center, cursor, draft.rotation);
      const c = adjustCenter(props.config, drawnSceneObject, draft.center);
      updateDrawnSceneObject({
        x_center: c.x,
        y_center: c.y,
        z_base: c.z,
        x_size: placementAxisSize(drawnSceneObject, "x",
          bounds.x_1 - bounds.x_0),
        y_size: placementAxisSize(drawnSceneObject, "y",
          bounds.y_1 - bounds.y_0),
      });
      if (preservesPlacementAxis(drawnSceneObject, "z")) {
        saveSceneObject(
          draft.center, cursor, cursor.z, draft.rotation);
        resetPlacement();
      } else {
        setDraft({ ...draft, corner: cursor, heightStartY: eventScreenY(e) });
      }
      return;
    }
    const height = Math.max(1, Math.round(
      cursor.z - draft.center.z));
    updateDrawnSceneObject(usesPlacementScale(drawnSceneObject)
      ? scaledPlacementSize(drawnSceneObject, height)
      : {
        z_size: placementAxisSize(drawnSceneObject, "z", height),
      });
    saveSceneObject(
      draft.center, draft.corner, cursor.z, draft.rotation);
    resetPlacement();
  }, [
    cursor,
    draft,
    enabled,
    resetPlacement,
    saveSceneObject,
    updateDrawnSceneObject,
    props.config,
  ]);

  // eslint-disable-next-line complexity
  const preview = React.useMemo(() => {
    if (!enabled || !cursor) { return undefined; }
    const drawnSceneObject = props.drawnSceneObject;
    const center = draft.center || cursor;
    const corner = draft.corner || cursor;
    const rotation = draft.center && draft.rotation === undefined
      ? sceneObjectPlacementRotation(
        draft.center, cursor, drawnSceneObject?.rotation)
      : draft.rotation ?? drawnSceneObject?.rotation ?? 0;
    const rotating = !!draft.center && draft.rotation === undefined;
    const bounds = sceneObjectCornersFromCenter(
      center, corner, rotation);
    const dragXSize = Math.max(1, bounds.x_1 - bounds.x_0);
    const dragYSize = Math.max(1, bounds.y_1 - bounds.y_0);
    const dragHeight = draft.corner && draft.center
      ? Math.max(1, cursor.z - draft.center.z)
      : 1;
    const scaledSize = draft.corner && drawnSceneObject
      && usesPlacementScale(drawnSceneObject)
      ? scaledPlacementSize(drawnSceneObject, dragHeight)
      : undefined;
    const height = draft.corner
      ? dragHeight
      : 1;
    const x = center.x;
    const y = center.y;
    const cursorPosition = draft.corner
      ? { x, y, z: cursor.z }
      : cursor;
    const groundZ = -props.config.bedZOffset - props.config.bedHeight;
    const spherePosition = get3DPosition(cursorPosition);
    const guideCenter = get3DPosition(center);
    const guidePoints = sceneObjectRotationGuidePoints(
      {
        x: guideCenter.x,
        y: guideCenter.y,
        z: groundZ + center.z + 5,
      },
      drawnSceneObject?.x_size ?? dragXSize,
      drawnSceneObject?.y_size ?? dragYSize,
      rotation);
    const showRotationGuide = rotating
      && sceneObjectRotationGuideVisible(rotation);
    const originPlanePosition = get3DPosition({ x: 0, y: 0 });
    const showOriginPlane = drawnSceneObject?.z_origin != "world";
    const originPlaneZ = draft.center?.z || cursor.z;
    const adjustedCenter = drawnSceneObject
      ? adjustCenter(props.config, drawnSceneObject, center)
      : center;
    const showGhost = drawnSceneObject
      && hasTranslucentPlacementPreview(drawnSceneObject)
      && (!draft.corner
        || (preservesFootprint(drawnSceneObject)
          && !preservesPlacementAxis(drawnSceneObject, "z")));
    return <Group name={"scene-object-placement-preview"}>
      {showOriginPlane && <Box
        name={"scene-object-origin-plane"}
        args={[
          BigDistance.ground * 2,
          BigDistance.ground * 2,
          ORIGIN_PLANE_THICKNESS,
        ]}
        position={[
          originPlanePosition.x,
          originPlanePosition.y,
          groundZ + originPlaneZ,
        ]}>
        <MeshBasicMaterial
          color={"dodgerblue"}
          transparent={true}
          opacity={0.16}
          depthWrite={false} />
      </Box>}
      <Sphere args={[PREVIEW_MARKER_RADIUS, 16, 16]} position={[
        spherePosition.x,
        spherePosition.y,
        groundZ + cursorPosition.z + 25,
      ]}>
        <MeshBasicMaterial color={"dodgerblue"} />
      </Sphere>
      {showRotationGuide &&
        <Line
          name={"scene-object-placement-rotation-guide"}
          points={guidePoints}
          color={"orange"}
          lineWidth={4}
          depthTest={false}
          renderOrder={FACE_SIZE_RENDER_ORDER}
          raycast={noControlRaycast} />}
      {showGhost && drawnSceneObject &&
        <SceneObjectPreview
          config={props.config}
          opacity={0.5}
          sceneObject={{
            ...drawnSceneObject,
            x_center: adjustedCenter.x,
            y_center: adjustedCenter.y,
            z_base: adjustedCenter.z,
            rotation,
          }} />}
      {draft.center &&
        <SceneObjectPreview
          config={props.config}
          sceneObject={{
            name: drawnSceneObject?.name || "",
            texture: drawnSceneObject?.texture || "concrete",
            shape: drawnSceneObject?.shape || "box",
            color: drawnSceneObject?.color || "#ffffff",
            show: drawnSceneObject?.show ?? true,
            x_center: adjustedCenter.x,
            y_center: adjustedCenter.y,
            z_base: draft.corner
              ? (drawnSceneObject?.z_base ?? adjustedCenter.z)
              : adjustedCenter.z,
            x_size: scaledSize?.x_size ?? placementPreviewAxisSize(
              drawnSceneObject, "x", dragXSize, rotating),
            y_size: scaledSize?.y_size ?? placementPreviewAxisSize(
              drawnSceneObject, "y", dragYSize, rotating),
            z_size: scaledSize?.z_size ?? placementPreviewAxisSize(
              drawnSceneObject, "z", height, rotating),
            x_origin: drawnSceneObject?.x_origin || "home",
            y_origin: drawnSceneObject?.y_origin || "home",
            z_origin: drawnSceneObject?.z_origin || "world",
            rotation,
          }} />}
    </Group>;
  }, [
    cursor,
    draft.center,
    draft.corner,
    draft.rotation,
    enabled,
    get3DPosition,
    props.config,
    props.drawnSceneObject,
  ]);

  return { onClick, onPointerMove, preview };
};

interface SceneObjectsProps {
  config: Config;
  sceneObjects?: TaggedSceneObject[];
  isPromo?: boolean;
  dispatch?: Function;
  hoverSelection?: ThreeDObjectSelection;
  selection?: ThreeDObjectSelection;
  onSelectObject?(selection: ThreeDObjectSelection): boolean | void;
  activeFocus: string;
  visible: boolean;
  designer?: Pick<DesignerState,
    "focusedSceneObjectField" | "hoveredSceneObject"
    | "unifiedSceneObjectSize">
  & Partial<Pick<DesignerState, "featuredScene">>;
}

export const HOVER_ALL_SCENE_OBJECTS = "all-user-scene-objects";

export interface SceneObjectDragPreview {
  uuid: string;
  update: Partial<TaggedSceneObject["body"]>;
}

export const sceneObjectWithDragPreview = (
  sceneObject: TaggedSceneObject,
  dragPreview: SceneObjectDragPreview | undefined,
) =>
  dragPreview?.uuid === sceneObject.uuid
    ? {
      ...sceneObject,
      body: { ...sceneObject.body, ...dragPreview.update },
    } as TaggedSceneObject
    : sceneObject;

export const sceneObjectMoveUpdate = (
  gardenPosition: { x: number, y: number },
  dragOffset: { x: number, y: number },
) => ({
  x_center: snapToGrid(gardenPosition.x + dragOffset.x),
  y_center: snapToGrid(gardenPosition.y + dragOffset.y),
});

const originX = (config: Config, xOrigin: string) =>
  (xOrigin == "max" ? config.bedLengthOuter : 0)
  + (xOrigin == "world" ? config.bedLengthOuter / 2 : 0);

const originY = (config: Config, yOrigin: string) =>
  (yOrigin == "max" ? config.bedWidthOuter : 0)
  + (yOrigin == "world" ? config.bedWidthOuter / 2 : 0);

const originZ = (config: Config, zOrigin: string) =>
  (zOrigin == "max" ? config.bedHeight + config.bedZOffset : 0)
  + (zOrigin == "home"
    ? config.bedHeight + config.bedZOffset + zZero(config)
    : 0);

const reCenter = (
  config: Config,
  sceneObject: TaggedSceneObject,
): { x: number, y: number, z: number } => {
  const { x_center, y_center, z_base, x_origin, y_origin, z_origin,
  } = sceneObject.body;
  return {
    x: x_center + originX(config, x_origin),
    y: y_center + originY(config, y_origin),
    z: z_base + originZ(config, z_origin),
  };
};

const adjustCenter = (
  config: Config,
  sceneObject: SceneObject,
  center: { x: number, y: number, z: number },
): { x: number, y: number, z: number } => {
  return {
    x: center.x - originX(config, sceneObject.x_origin),
    y: center.y - originY(config, sceneObject.y_origin),
    z: center.z - originZ(config, sceneObject.z_origin),
  };
};

export const sceneObjectPosition = (
  config: Config,
  sceneObject: TaggedSceneObject,
): [number, number, number] => {
  const { z_size } = sceneObject.body;
  const center = reCenter(config, sceneObject);
  const position = get3DPositionFunc(config)(center);
  return [
    position.x,
    position.y,
    center.z + z_size / 2 - config.bedHeight - config.bedZOffset,
  ];
};

export const sceneObjectPoint = (
  config: Config,
  point: { x: number, y: number, z: number },
): [number, number, number] => {
  const position = get3DPositionFunc(config)(point);
  return [
    position.x,
    position.y,
    point.z - config.bedHeight - config.bedZOffset,
  ];
};

export type SceneObjectRotationCorner =
  "x0y0" | "x0y1" | "x1y0" | "x1y1";

const SCENE_OBJECT_ROTATION_CONTROL_CORNERS: SceneObjectRotationCorner[] = [
  "x1y0", "x0y1",
];

const sceneObjectRotationCornerPoint = (
  config: Config,
  bounds: SceneObjectBounds,
  center: SceneObjectCursor,
  rotation: number,
  corner: SceneObjectRotationCorner,
) => {
  const pivot = pointToRecord(sceneObjectPoint(config, center));
  const point = pointToRecord(sceneObjectPoint(config, {
    x: corner.startsWith("x0") ? bounds.x0 : bounds.x1,
    y: corner.endsWith("y0") ? bounds.y0 : bounds.y1,
    z: bounds.z0,
  }));
  return rotatePointAboutZ(
    point, pivot, sceneObjectRotation(rotation)[2]);
};

export const sceneObjectRotationControlPoints = (
  config: Config,
  bounds: SceneObjectBounds,
  center: SceneObjectCursor,
  rotation: number,
  scale = 1,
  corner: SceneObjectRotationCorner = "x1y0",
): [number, number, number][] => {
  const pivot = pointToRecord(sceneObjectPoint(config, center));
  const rotatedCorner = sceneObjectRotationCornerPoint(
    config, bounds, center, rotation, corner);
  const cornerOffset = new Vector3(
    rotatedCorner.x - pivot.x,
    rotatedCorner.y - pivot.y,
    0,
  );
  const radius = cornerOffset.length()
    + ROTATION_CONTROL_SPACING * scale;
  const arc = Math.min(
    ROTATION_CONTROL_ARC,
    ROTATION_CONTROL_MAX_LENGTH * scale / radius,
  );
  const midpoint = Math.atan2(cornerOffset.y, cornerOffset.x);
  const start = midpoint - arc / 2;
  const z = pivot.z + 5;
  return range(ROTATION_CONTROL_SEGMENTS + 1).map(index => {
    const angle = start
      + arc * index / ROTATION_CONTROL_SEGMENTS;
    return [
      pivot.x + Math.cos(angle) * radius,
      pivot.y + Math.sin(angle) * radius,
      z,
    ];
  });
};

export const sceneObjectRotationFromPointer = (
  startRotation: number,
  startAngle: number,
  pivot: XYZRecord,
  pointer: XYZRecord,
) => {
  const pointerAngle = Math.atan2(
    pointer.y - pivot.y,
    pointer.x - pivot.x,
  );
  const angleDelta = pointerAngle - startAngle;
  const wrappedDelta = Math.atan2(
    Math.sin(angleDelta), Math.cos(angleDelta));
  const rotation = startRotation + wrappedDelta * 180 / Math.PI;
  const rolledRotation = snapSceneObjectRotation(rotation);
  return rolledRotation == 0 ? 0 : rolledRotation;
};

interface SceneObjectSelectionMarkersProps {
  config: Config;
  sceneObject: TaggedSceneObject;
  dispatch?: Function;
  focusedField: string;
  bounds: SceneObjectBounds;
  center: { x: number, y: number, z: number };
  interactionLocked(): boolean;
  setInteractionLocked(locked: boolean): void;
  unifiedSize?: boolean;
  onPreview(update: Partial<TaggedSceneObject["body"]>): void;
  onPreviewEnd(): void;
}

interface SceneObjectRotationControlProps {
  config: Config;
  sceneObject: TaggedSceneObject;
  bounds: SceneObjectBounds;
  center: SceneObjectCursor;
  dispatch?: Function;
  focusedField: string;
  interactionLocked(): boolean;
  setInteractionLocked(locked: boolean): void;
  onPreview(update: Partial<TaggedSceneObject["body"]>): void;
  onPreviewEnd(): void;
}

interface SceneObjectSelectionMarkerProps {
  name: string;
  position: [number, number, number];
  hovered?: boolean;
  scale: number;
  onHoverChange?(hovered: boolean): void;
  onPointerDown(e: ThreeEvent<PointerEvent>): void;
  onPointerMove(e: ThreeEvent<PointerEvent>): void;
  onPointerUp(e: ThreeEvent<PointerEvent>): void;
  onPointerCancel(): void;
}

interface FaceSizeDragState {
  bounds: SceneObjectBounds;
  center: SceneObjectCursor;
  body: TaggedSceneObject["body"];
  markerZ: number;
}

interface RotationDragState {
  corner: SceneObjectRotationCorner;
  pivot: XYZRecord;
  startAngle: number;
  startRotation: number;
}

interface SceneObjectMoveHandleProps {
  config: Config;
  sceneObject: TaggedSceneObject;
  showBottomEdge: boolean;
  args: [number, number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  dispatch?: Function;
  setInteractionLocked(locked: boolean): void;
  onPreview(update: Partial<TaggedSceneObject["body"]>): void;
  onPreviewEnd(): void;
  onDragStateChange?(dragging: boolean): void;
}

export const stopSceneObjectMarkerEvent = (
  e: ThreeEvent<PointerEvent>,
) => {
  stopControlEvent(e);
};

export const stopSceneObjectMarkerDragEvent = (
  e: ThreeEvent<PointerEvent>,
) => {
  stopControlDragEvent(e);
};

const hasAncestorName = (
  object: unknown,
  predicate: (name: string) => boolean,
) => {
  let current = object as { name?: string, parent?: unknown } | undefined;
  while (current) {
    if (predicate(current.name || "")) { return true; }
    current = current.parent as typeof current;
  }
  return false;
};

const eventHitsSceneObjectInteraction = (e: ThreeEvent<PointerEvent>) =>
  (e.intersections || []).some(intersection =>
    hasAncestorName(intersection.object, name =>
      (name.startsWith("scene-object-base-") &&
        name.endsWith("-axis-arrow")) ||
      name.startsWith("scene-object-face-size-arrow") ||
      name.startsWith("scene-object-rotation-control") ||
      name.startsWith("scene-object-selection-marker")));

const SceneObjectSelectionMarker =
  (props: SceneObjectSelectionMarkerProps) => {
    return <ControlHandle
      name={`${props.name}-control`}
      onHoverChange={props.onHoverChange}
      onDragStart={({ event }) => props.onPointerDown(event)}
      onDrag={({ event }) => props.onPointerMove(event)}
      onDragEnd={({ event }) => props.onPointerUp(event)}
      onDragCancel={props.onPointerCancel}>
      {state => <ControlSphere
        name={props.name}
        position={props.position}
        radius={MARKER_RADIUS * props.scale}
        color={"dodgerblue"}
        hoverColor={"deepskyblue"}
        hovered={state.hovered || props.hovered}
        depthTest={true}
        depthWrite={true}
        renderOrder={FACE_MARKER_RENDER_ORDER} />}
    </ControlHandle>;
  };

const SceneObjectSelectionMarkers =
  (props: SceneObjectSelectionMarkersProps) => {
    const {
      focusedField,
      config,
      dispatch,
      sceneObject,
      bounds,
      center,
      onPreview,
      onPreviewEnd,
    } = props;
    const [faceDragOffset, setFaceDragOffset] =
      React.useState({ x: 0, y: 0 });
    const [faceSizeDrag, setFaceSizeDrag] =
      React.useState<FaceSizeDragState>();
    const [hoveredFace, setHoveredFace] = React.useState<number>();
    const [faceDragging, setFaceDragging] = React.useState(false);
    const [zSizeDrag, setZSizeDrag] = React.useState<ZSizeDragState>();
    const [uniformSizeDrag, setUniformSizeDrag] =
      React.useState<UniformSizeDragState>();
    const getGardenPosition = React.useMemo(
      () => getGardenPositionFunc(config),
      [config]);
    const rotation = sceneObjectRotation(sceneObject.body.rotation)[2];
    const pivot = React.useMemo(
      () => pointToRecord(sceneObjectPoint(config, center)),
      [center, config]);
    const rotatePoint = React.useCallback((
      point: XYZRecord,
      radians = rotation,
    ) => rotatePointAboutZ(point, pivot, radians), [pivot, rotation]);
    const rotatedSceneObjectPoint = React.useCallback((
      gardenPosition: SceneObjectCursor,
    ): [number, number, number] => {
      const point = pointToRecord(sceneObjectPoint(config, gardenPosition));
      const rotated = rotatePoint(point);
      return [rotated.x, rotated.y, rotated.z];
    }, [config, rotatePoint]);
    const updateSceneObject = React.useCallback((
      update: Partial<TaggedSceneObject["body"]>,
    ) => {
      if (!dispatch) { return; }
      const resource = sceneObject as unknown as TaggedResource;
      dispatch(edit(resource, update));
      dispatch(save(sceneObject.uuid));
    }, [dispatch, sceneObject]);
    const faceResizeUpdate = React.useCallback((
      field: "x0" | "x1" | "y0" | "y1",
      markerZ: number,
      e: ThreeEvent<PointerEvent>,
      // eslint-disable-next-line complexity
    ) => {
      e.stopPropagation();
      const dragMarkerZ = faceSizeDrag?.markerZ ?? markerZ;
      const dragBounds = faceSizeDrag?.bounds || bounds;
      const dragCenter = faceSizeDrag?.center || center;
      const dragBody = faceSizeDrag?.body || sceneObject.body;
      const dragPivot = pointToRecord(
        sceneObjectPoint(config, dragCenter));
      const markerPoint = pointerRayPointAtZ(e, dragMarkerZ);
      const localMarkerPoint = rotatePointAboutZ(
        markerPoint, dragPivot, -rotation);
      const rawGardenPosition = getGardenPosition(localMarkerPoint);
      const gardenPosition = {
        x: rawGardenPosition.x + faceDragOffset.x,
        y: rawGardenPosition.y + faceDragOffset.y,
      };
      if (field == "x0" || field == "x1") {
        const fixedX = field == "x0" ? dragBounds.x1 : dragBounds.x0;
        const resizedX = field == "x0"
          ? Math.min(gardenPosition.x, fixedX - 1)
          : Math.max(gardenPosition.x, fixedX + 1);
        const x = (resizedX + fixedX) / 2;
        const localCenter = sceneObjectPoint(
          config, { ...dragCenter, x });
        const rotatedCenter = rotatePointAboutZ(
          pointToRecord(localCenter), dragPivot, rotation);
        const worldCenter = getGardenPosition(rotatedCenter);
        const c = adjustCenter(config, dragBody, {
          ...dragCenter,
          x: worldCenter.x,
          y: worldCenter.y,
        });
        const xSize = snapSceneObjectSize(Math.abs(resizedX - fixedX));
        const update = {
          x_center: snapToGrid(c.x),
          x_size: xSize,
        };
        return rotation == 0
          ? update
          : { ...update, y_center: snapToGrid(c.y) };
      }
      const fixedY = field == "y0" ? dragBounds.y1 : dragBounds.y0;
      const resizedY = field == "y0"
        ? Math.min(gardenPosition.y, fixedY - 1)
        : Math.max(gardenPosition.y, fixedY + 1);
      const y = (resizedY + fixedY) / 2;
      const localCenter = sceneObjectPoint(
        config, { ...dragCenter, y });
      const rotatedCenter = rotatePointAboutZ(
        pointToRecord(localCenter), dragPivot, rotation);
      const worldCenter = getGardenPosition(rotatedCenter);
      const c = adjustCenter(config, dragBody, {
        ...dragCenter,
        x: worldCenter.x,
        y: worldCenter.y,
      });
      const ySize = snapSceneObjectSize(Math.abs(resizedY - fixedY));
      const update = {
        y_center: snapToGrid(c.y),
        y_size: ySize,
      };
      return rotation == 0
        ? update
        : { ...update, x_center: snapToGrid(c.x) };
    }, [
      bounds,
      center,
      config,
      faceDragOffset,
      faceSizeDrag,
      getGardenPosition,
      rotation,
      sceneObject,
    ]);
    const faceResizePointerDown = React.useCallback((
      markerGardenPosition: SceneObjectCursor,
      markerPosition: [number, number, number],
      e: ThreeEvent<PointerEvent>,
    ) => {
      const markerPoint = pointerRayPointAtZ(e, markerPosition[2]);
      const localMarkerPoint = rotatePoint(markerPoint, -rotation);
      const gardenPosition = getGardenPosition(localMarkerPoint);
      setFaceDragOffset({
        x: markerGardenPosition.x - gardenPosition.x,
        y: markerGardenPosition.y - gardenPosition.y,
      });
      setFaceSizeDrag({
        bounds,
        center,
        body: sceneObject.body,
        markerZ: markerPosition[2],
      });
      onPreview({});
    }, [
      bounds,
      center,
      getGardenPosition,
      onPreview,
      rotatePoint,
      rotation,
      sceneObject.body,
    ]);
    const uniformSizeUpdate = React.useCallback((
      e: ThreeEvent<PointerEvent>,
      drag: UniformSizeDragState,
    ) => {
      const parameter = pointerRayParameterOnLine(
        e, drag.startPoint, drag.direction);
      const delta = (parameter - drag.startParameter) * 2 / Math.sqrt(3);
      const referenceSize = Math.max(1, drag.startReferenceSize);
      const scale = snapSceneObjectSize(referenceSize + delta) / referenceSize;
      return {
        x_size: snapSceneObjectSize(drag.startSizes.x_size * scale),
        y_size: snapSceneObjectSize(drag.startSizes.y_size * scale),
        z_size: snapSceneObjectSize(drag.startSizes.z_size * scale),
      };
    }, []);
    const topResizeHandlers = topResizeMarkerHandlers({
      config,
      center,
      sceneObject,
      onPreview,
      updateSceneObject,
      onPreviewEnd,
    });
    const scale = useObjectMarkerScale(
      sceneObjectPoint(config, center));
    const markerRadius = MARKER_RADIUS * scale;
    const faceMarkers = [
      {
        field: "x0" as const,
        label: `${sceneObject.body.x_size}mm`,
        direction: "x-" as const,
        gardenPosition: {
          x: bounds.x0,
          y: center.y,
          z: (bounds.z0 + bounds.z1) / 2,
        },
      },
      {
        field: "x1" as const,
        label: `${sceneObject.body.x_size}mm`,
        direction: "x+" as const,
        gardenPosition: {
          x: bounds.x1,
          y: center.y,
          z: (bounds.z0 + bounds.z1) / 2,
        },
      },
      {
        field: "y0" as const,
        label: `${sceneObject.body.y_size}mm`,
        direction: "y-" as const,
        gardenPosition: {
          x: center.x,
          y: bounds.y0,
          z: (bounds.z0 + bounds.z1) / 2,
        },
      },
      {
        field: "y1" as const,
        label: `${sceneObject.body.y_size}mm`,
        direction: "y+" as const,
        gardenPosition: {
          x: center.x,
          y: bounds.y1,
          z: (bounds.z0 + bounds.z1) / 2,
        },
      },
    ];
    const individualFaceMarkers = props.unifiedSize ? [] : faceMarkers;
    const uniformScaleMarker = {
      label: `${Math.max(
        sceneObject.body.x_size,
        sceneObject.body.y_size,
        sceneObject.body.z_size,
      )}mm`,
      direction: "xyz+" as const,
      gardenPosition: {
        x: bounds.x1 + markerRadius * 0,
        y: bounds.y1 + markerRadius * 0,
        z: bounds.z1 + markerRadius * 0,
      },
    };
    const markers = [
      ...individualFaceMarkers.map((marker, index) => {
        const position = rotatedSceneObjectPoint(marker.gardenPosition);
        return {
          position,
          hovered: hoveredFace === index,
          onHoverChange: (hovered: boolean) => {
            if (props.interactionLocked()) { return; }
            if (faceDragging) { return; }
            setHoveredFace(hovered ? index : undefined);
            setSceneObjectFieldFocus(
              dispatch,
              hovered ? sizeFieldFromDirection(marker.direction) : undefined);
          },
          onPointerDown: (e: ThreeEvent<PointerEvent>) => {
            props.setInteractionLocked(true);
            setFaceDragging(true);
            setSceneObjectFieldFocus(
              dispatch,
              sizeFieldFromDirection(marker.direction));
            faceResizePointerDown(marker.gardenPosition, position, e);
          },
          onPointerMove: (e: ThreeEvent<PointerEvent>) =>
            onPreview(faceResizeUpdate(marker.field, position[2], e)),
          onPointerUp: (e: ThreeEvent<PointerEvent>) => {
            updateSceneObject(faceResizeUpdate(marker.field, position[2], e));
            setFaceDragOffset({ x: 0, y: 0 });
            setFaceSizeDrag(undefined);
            setFaceDragging(false);
            props.setInteractionLocked(false);
            setSceneObjectFieldFocus(dispatch, undefined);
            onPreviewEnd();
          },
          onPointerCancel: () => {
            setFaceDragOffset({ x: 0, y: 0 });
            setFaceSizeDrag(undefined);
            setFaceDragging(false);
            props.setInteractionLocked(false);
            setSceneObjectFieldFocus(dispatch, undefined);
            onPreviewEnd();
          },
        };
      }),
      ...(!props.unifiedSize
        ? [{
          position: sceneObjectPoint(
            config, { ...center, z: bounds.z1 + markerRadius / 2 }),
          hovered: hoveredFace === 4,
          onHoverChange: (hovered: boolean) => {
            if (props.interactionLocked()) { return; }
            if (faceDragging) { return; }
            setHoveredFace(hovered ? 4 : undefined);
            setSceneObjectFieldFocus(
              dispatch,
              hovered ? "z_size" : undefined);
          },
          onPointerDown: (e: ThreeEvent<PointerEvent>) => {
            const pointerHeight = sceneObjectTopResizeHeight(
              e, config, center, sceneObject)
              ?? sceneObject.body.z_size;
            props.setInteractionLocked(true);
            setFaceDragging(true);
            setZSizeDrag({
              sceneObject: {
                ...sceneObject,
                body: { ...sceneObject.body },
              },
              pointerOffset: sceneObject.body.z_size - pointerHeight,
            });
            setSceneObjectFieldFocus(dispatch, "z_size");
            onPreview({});
          },
          onPointerMove: (e: ThreeEvent<PointerEvent>) => {
            if (!zSizeDrag) { return; }
            onPreview(sceneObjectTopResizeUpdate(
              e,
              config,
              center,
              zSizeDrag.sceneObject,
              zSizeDrag.pointerOffset,
            ));
          },
          onPointerUp: (e: ThreeEvent<PointerEvent>) => {
            if (zSizeDrag) {
              updateSceneObject(sceneObjectTopResizeUpdate(
                e,
                config,
                center,
                zSizeDrag.sceneObject,
                zSizeDrag.pointerOffset,
              ));
              onPreviewEnd();
            } else {
              topResizeHandlers.onPointerUp(e);
            }
            setZSizeDrag(undefined);
            setFaceDragging(false);
            props.setInteractionLocked(false);
            setSceneObjectFieldFocus(dispatch, undefined);
          },
          onPointerCancel: () => {
            setZSizeDrag(undefined);
            setFaceDragging(false);
            props.setInteractionLocked(false);
            setSceneObjectFieldFocus(dispatch, undefined);
            onPreviewEnd();
          },
        }]
        : []),
      {
        position: rotatedSceneObjectPoint(
          uniformScaleMarker.gardenPosition),
        hovered: hoveredFace === 5,
        onHoverChange: (hovered: boolean) => {
          if (props.interactionLocked()) { return; }
          if (faceDragging) { return; }
          setHoveredFace(hovered ? 5 : undefined);
          setSceneObjectFieldFocus(dispatch, hovered ? "size" : undefined);
        },
        onPointerDown: (e: ThreeEvent<PointerEvent>) => {
          const startPoint = pointToRecord(rotatedSceneObjectPoint(
            uniformScaleMarker.gardenPosition));
          const rotatedDirection = rotatePointAboutZ(
            { x: XYZ_UNIT.x, y: XYZ_UNIT.y, z: XYZ_UNIT.z },
            { x: 0, y: 0, z: 0 },
            rotation,
          );
          const direction = new Vector3(
            rotatedDirection.x,
            rotatedDirection.y,
            rotatedDirection.z,
          );
          props.setInteractionLocked(true);
          setFaceDragging(true);
          setUniformSizeDrag({
            startParameter: pointerRayParameterOnLine(
              e, startPoint, direction),
            startReferenceSize: Math.max(
              1,
              sceneObject.body.x_size,
              sceneObject.body.y_size,
              sceneObject.body.z_size,
            ),
            startSizes: {
              x_size: sceneObject.body.x_size,
              y_size: sceneObject.body.y_size,
              z_size: sceneObject.body.z_size,
            },
            startPoint,
            direction,
          });
          setSceneObjectFieldFocus(dispatch, "size");
          onPreview({});
        },
        onPointerMove: (e: ThreeEvent<PointerEvent>) => {
          if (!uniformSizeDrag) { return; }
          onPreview(uniformSizeUpdate(e, uniformSizeDrag));
        },
        onPointerUp: (e: ThreeEvent<PointerEvent>) => {
          if (uniformSizeDrag) {
            updateSceneObject(uniformSizeUpdate(e, uniformSizeDrag));
          }
          setUniformSizeDrag(undefined);
          setFaceDragging(false);
          props.setInteractionLocked(false);
          setSceneObjectFieldFocus(dispatch, undefined);
          onPreviewEnd();
        },
        onPointerCancel: () => {
          setUniformSizeDrag(undefined);
          setFaceDragging(false);
          props.setInteractionLocked(false);
          setSceneObjectFieldFocus(dispatch, undefined);
          onPreviewEnd();
        },
      },
    ];
    const faceSizeIndicators = [
      ...individualFaceMarkers,
      ...(!props.unifiedSize
        ? [{
          label: `${sceneObject.body.z_size}mm`,
          direction: "z+" as const,
          gardenPosition: { ...center, z: bounds.z1 + markerRadius / 2 },
        }]
        : []),
      uniformScaleMarker,
    ];
    const renderFaceSizeIndicator = (
      indicator: typeof faceSizeIndicators[number],
      index: number,
    ) => {
      const unrotatedStart = pointToRecord(sceneObjectPoint(
        config, indicator.gardenPosition));
      const start = rotatePoint(unrotatedStart);
      const end = rotatePoint(
        faceArrowEnd(unrotatedStart, indicator.direction, scale));
      const marker = markers[index];
      return <SingleAxisIndicator
        key={index}
        name={`scene-object-face-size-arrow-${index}`}
        color={"dodgerblue"}
        hovered={marker.hovered}
        onHoverChange={marker.onHoverChange}
        scale={scale}
        start={start}
        end={end}
        label={indicator.label}
        hideLabel={indicator.direction == "xyz+" && !props.unifiedSize}
        labelVisible={sizeLabelVisible(focusedField, indicator.direction)}
        onPointerDown={marker.onPointerDown}
        onPointerMove={marker.onPointerMove}
        onPointerUp={marker.onPointerUp}
        onPointerCancel={marker.onPointerCancel} />;
    };
    return <>
      {faceSizeIndicators.map(renderFaceSizeIndicator)}
      {markers.map((marker, index) =>
        <SceneObjectSelectionMarker
          key={index}
          name={`scene-object-selection-marker-${index}`}
          position={marker.position}
          hovered={marker.hovered}
          scale={scale}
          onHoverChange={marker.onHoverChange}
          onPointerDown={marker.onPointerDown}
          onPointerMove={marker.onPointerMove}
          onPointerUp={marker.onPointerUp}
          onPointerCancel={marker.onPointerCancel} />)}
    </>;
  };

const rotationArrowHeadRotation = (
  from: [number, number, number],
  to: [number, number, number],
): [number, number, number] =>
  [
    0,
    0,
    Math.atan2(to[1] - from[1], to[0] - from[0]) - Math.PI / 2,
  ];

const SceneObjectRotationControl =
  (props: SceneObjectRotationControlProps) => {
    const {
      bounds,
      center,
      config,
      dispatch,
      onPreview,
      onPreviewEnd,
      sceneObject,
    } = props;
    const [drag, setDrag] = React.useState<RotationDragState>();
    const [hoveredCorner, setHoveredCorner] =
      React.useState<SceneObjectRotationCorner>();
    const scale = useObjectMarkerScale(
      sceneObjectPoint(config, center));
    const pivot = pointToRecord(sceneObjectPoint(config, center));
    const guidePoints = sceneObjectRotationGuidePoints(
      {
        ...pivot,
        z: pivot.z + 5,
      },
      sceneObject.body.x_size,
      sceneObject.body.y_size,
      sceneObject.body.rotation);
    const updateSceneObject = (
      update: Partial<TaggedSceneObject["body"]>,
    ) => {
      if (!dispatch) { return; }
      const resource = sceneObject as unknown as TaggedResource;
      dispatch(edit(resource, update));
      dispatch(save(sceneObject.uuid));
    };
    const rotationUpdate = (point: Vector3) => drag
      ? {
        rotation: sceneObjectRotationFromPointer(
          drag.startRotation,
          drag.startAngle,
          drag.pivot,
          point,
        ),
      }
      : {};
    const renderControl = (corner: SceneObjectRotationCorner) => {
      const points = sceneObjectRotationControlPoints(
        config, bounds, center, sceneObject.body.rotation, scale, corner);
      const start = points[0];
      const next = points[1];
      const previous = points[points.length - 2];
      const end = points[points.length - 1];
      const labelPoint = points[Math.floor(points.length / 2)];
      const curve = new CatmullRomCurve3(
        points.map(point => new Vector3(...point)));
      const active = hoveredCorner == corner || drag?.corner == corner;
      const color = active ? "deepskyblue" : "dodgerblue";
      return <ControlHandle
        key={corner}
        name={"scene-object-rotation-control"}
        canStart={() => !props.interactionLocked()}
        constraint={planeConstraint(
          "xy", [pivot.x, pivot.y, pivot.z])}
        onHoverChange={isHovered => {
          if (props.interactionLocked() && !drag) { return; }
          setHoveredCorner(current => {
            if (isHovered) { return corner; }
            return current == corner ? undefined : current;
          });
          setSceneObjectFieldFocus(
            dispatch, isHovered ? "rotation" : undefined);
        }}
        onDragStart={({ point }) => {
          props.setInteractionLocked(true);
          setDrag({
            corner,
            pivot,
            startAngle: Math.atan2(
              point.y - pivot.y, point.x - pivot.x),
            startRotation: sceneObject.body.rotation,
          });
          setSceneObjectFieldFocus(dispatch, "rotation");
          onPreview({});
        }}
        onDrag={({ point }) => {
          if (!drag) { return; }
          onPreview(rotationUpdate(point));
        }}
        onDragEnd={({ point }) => {
          if (drag) {
            updateSceneObject(rotationUpdate(point));
          }
          setDrag(undefined);
          setHoveredCorner(undefined);
          props.setInteractionLocked(false);
          setSceneObjectFieldFocus(dispatch, undefined);
          onPreviewEnd();
        }}
        onDragCancel={() => {
          setDrag(undefined);
          setHoveredCorner(undefined);
          props.setInteractionLocked(false);
          setSceneObjectFieldFocus(dispatch, undefined);
          onPreviewEnd();
        }}>
        <Group
          name={"scene-object-rotation-control-shape"}
          renderOrder={FACE_SIZE_RENDER_ORDER}>
          <Mesh
            name={"scene-object-rotation-control-arc"}
            renderOrder={FACE_SIZE_RENDER_ORDER}>
            <tubeGeometry args={[
              curve,
              ROTATION_CONTROL_SEGMENTS,
              ROTATION_CONTROL_WIDTH * scale / 2,
              8,
              false,
            ]} />
            <MeshPhongMaterial
              color={color}
              depthTest={true}
              depthWrite={true}
              toneMapped={false} />
          </Mesh>
          <Cone
            name={"scene-object-rotation-control-start"}
            args={[
              ROTATION_CONTROL_HEAD_RADIUS * scale,
              ROTATION_CONTROL_HEAD_LENGTH * scale,
              16,
            ]}
            position={start}
            rotation={rotationArrowHeadRotation(next, start)}
            renderOrder={FACE_SIZE_RENDER_ORDER}>
            <MeshPhongMaterial color={color} toneMapped={false} />
          </Cone>
          <Cone
            name={"scene-object-rotation-control-end"}
            args={[
              ROTATION_CONTROL_HEAD_RADIUS * scale,
              ROTATION_CONTROL_HEAD_LENGTH * scale,
              16,
            ]}
            position={end}
            rotation={rotationArrowHeadRotation(previous, end)}
            renderOrder={FACE_SIZE_RENDER_ORDER}>
            <MeshPhongMaterial color={color} toneMapped={false} />
          </Cone>
          <ControlLabel
            name={"scene-object-rotation-control-label"}
            position={[
              labelPoint[0],
              labelPoint[1],
              labelPoint[2] + ROTATION_CONTROL_WIDTH * scale * 2,
            ]}
            fontSize={FACE_SIZE_LABEL_SIZE * scale}
            color={color}
            depthTest={true}
            depthWrite={true}
            renderOrder={FACE_SIZE_RENDER_ORDER}
            visible={props.focusedField == "rotation" || active}>
            {`${sceneObject.body.rotation}°`}
          </ControlLabel>
        </Group>
      </ControlHandle>;
    };
    return <>
      {drag && sceneObjectRotationGuideVisible(sceneObject.body.rotation) &&
        <Line
          name={"scene-object-edit-rotation-guide"}
          points={guidePoints}
          color={"orange"}
          lineWidth={4}
          depthTest={false}
          renderOrder={FACE_SIZE_RENDER_ORDER}
          raycast={noControlRaycast} />}
      {SCENE_OBJECT_ROTATION_CONTROL_CORNERS.map(renderControl)}
    </>;
  };

const SceneObjectMoveHandle = (props: SceneObjectMoveHandleProps) => {
  const {
    args,
    config,
    dispatch,
    onPreview,
    onPreviewEnd,
    position,
    sceneObject,
    setInteractionLocked,
    onDragStateChange,
  } = props;
  const bottomEdgeSize: [number, number, number] = [
    args[0] + EDGE_LINE_WIDTH * 2,
    args[1] + EDGE_LINE_WIDTH * 2,
    0,
  ];
  const bottomEdgePosition: [number, number, number] = [
    0,
    0,
    -args[2] / 2 + EDGE_LINE_WIDTH,
  ];
  const dragging = React.useRef(false);
  const dragOffset = React.useRef({ x: 0, y: 0 });
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(config),
    [config]);
  const groundPlaneZ = sceneObjectPoint(config, {
    x: sceneObject.body.x_center,
    y: sceneObject.body.y_center,
    z: reCenter(config, sceneObject).z,
  })[2];
  const moveUpdate = React.useCallback((point: Vector3) => {
    const gardenPosition = getGardenPosition(point);
    return sceneObjectMoveUpdate(gardenPosition, dragOffset.current);
  }, [getGardenPosition]);
  const updateSceneObject = React.useCallback((
    update: Partial<TaggedSceneObject["body"]>,
  ) => {
    if (!dispatch) { return; }
    const resource = sceneObject as unknown as TaggedResource;
    dispatch(edit(resource, update));
    dispatch(save(sceneObject.uuid));
  }, [dispatch, sceneObject]);
  const stopDragging = React.useCallback(() => {
    if (!dragging.current) { return; }
    dragging.current = false;
    onDragStateChange?.(false);
    setInteractionLocked(false);
    onPreviewEnd();
  }, [onDragStateChange, onPreviewEnd, setInteractionLocked]);

  return <ControlHandle
    name={"scene-object-move-handle"}
    position={position}
    rotation={props.rotation}
    constraint={planeConstraint("xy", [0, 0, groundPlaneZ])}
    canStart={event => !eventHitsSceneObjectInteraction(event)}
    onDragStart={({ point }) => {
      const gardenPosition = getGardenPosition(point);
      dragOffset.current = {
        x: sceneObject.body.x_center - gardenPosition.x,
        y: sceneObject.body.y_center - gardenPosition.y,
      };
      dragging.current = true;
      onDragStateChange?.(true);
      setInteractionLocked(true);
      onPreview({});
    }}
    onDrag={({ point }) => {
      if (!dragging.current) { return; }
      onPreview(moveUpdate(point));
    }}
    onDragEnd={({ point }) => {
      if (!dragging.current) { return; }
      dragging.current = false;
      onDragStateChange?.(false);
      setInteractionLocked(false);
      updateSceneObject(moveUpdate(point));
      onPreviewEnd();
    }}
    onDragCancel={stopDragging}>
    <Box args={args} renderOrder={999}>
      <MeshBasicMaterial
        color={"white"}
        transparent={true}
        opacity={0}
        depthTest={false} />
      <Edges color={"white"} lineWidth={EDGE_LINE_WIDTH} />
      {props.showBottomEdge &&
        <Box
          name={"scene-object-bottom-edge"}
          args={bottomEdgeSize}
          position={bottomEdgePosition}
          renderOrder={1000}
          raycast={noControlRaycast}>
          <MeshBasicMaterial
            color={"yellow"}
            transparent={true}
            opacity={0}
            depthWrite={false}
            toneMapped={false} />
          <Edges
            color={"yellow"}
            lineWidth={EDGE_LINE_WIDTH}
            toneMapped={false} />
        </Box>}
    </Box>
  </ControlHandle>;
};

interface SceneObjectOriginMarkersProps {
  config: Config;
  sceneObject: TaggedSceneObject;
  focusedField: string;
  center: { x: number, y: number, z: number };
  dispatch?: Function;
  interactionLocked(): boolean;
  setInteractionLocked(locked: boolean): void;
  onPreview(update: Partial<TaggedSceneObject["body"]>): void;
  onPreviewEnd(): void;
  bodyDragging?: boolean;
}

interface ObjectBaseAxesProps extends SceneObjectOriginMarkersProps {
  onActiveAxisChange(axis: AxisName | undefined): void;
}

interface OriginAxisIndicatorProps {
  name: string;
  axis: AxisName;
  scale: number;
  labelVisible?: boolean;
  start: Record<"x" | "y" | "z", number>;
  end: Record<"x" | "y" | "z", number>;
}

interface OriginMarker {
  name: string;
  showSphere?: boolean;
  position: [number, number, number];
  arrowStart?: [number, number, number];
  arrowEnd?: [number, number, number];
}

interface SingleAxisIndicatorProps {
  name: string;
  color: string;
  scale: number;
  start: Record<"x" | "y" | "z", number>;
  end: Record<"x" | "y" | "z", number>;
  labelVisible?: boolean;
  label: string;
  hideLabel?: boolean;
  hovered?: boolean;
  onHoverChange?(hovered: boolean): void;
  onPointerDown?(e: ThreeEvent<PointerEvent>): void;
  onPointerMove?(e: ThreeEvent<PointerEvent>): void;
  onPointerUp?(e: ThreeEvent<PointerEvent>): void;
  onPointerCancel?(): void;
}

type Direction = "x-" | "x+" | "y-" | "y+" | "z+" | "xyz+";
type AxisName = "x" | "y" | "z";
interface AxisDragState {
  axis: AxisName;
  offset: number;
  startParameter: number;
  startZ: number;
}

interface ZSizeDragState {
  sceneObject: TaggedSceneObject;
  pointerOffset: number;
}

interface UniformSizeDragState {
  startParameter: number;
  startReferenceSize: number;
  startSizes: Record<"x_size" | "y_size" | "z_size", number>;
  startPoint: XYZRecord;
  direction: Vector3;
}

const pointToRecord = ([x, y, z]: [number, number, number]) => ({ x, y, z });

const sizeLabelVisible = (focusedField: string, direction: Direction) => {
  if (focusedField == "size") { return true; }
  if (direction == "xyz+") { return false; }
  const axis = direction[0];
  return focusedField == `${axis}_size`;
};

const sizeFieldFromDirection = (direction: Direction) =>
  `${direction[0]}_size`;

const originLabelVisible = (
  focusedField: string,
  axis: AxisName,
  bodyDragging = false,
) =>
  (bodyDragging && (axis == "x" || axis == "y")) ||
  focusedField == `${axis}_origin` ||
  focusedField == (axis == "z" ? "z_base" : `${axis}_center`);

const centerFieldFromAxis = (axis: AxisName) =>
  axis == "z" ? "z_base" : `${axis}_center`;

const setSceneObjectFieldFocus = (
  dispatch: Function | undefined,
  field: string | undefined,
) => dispatch?.(setFocusedSceneObjectField(field));

export const objectMarkerScale = (distance: number) =>
  Math.min(
    MAX_OBJECT_MARKER_SCALE,
    Math.max(1, distance / BASE_OBJECT_MARKER_CAMERA_DISTANCE),
  );

const useObjectMarkerScale = (position: [number, number, number]) => {
  const { camera } = useThree();
  const [scale, setScale] = React.useState(1);
  useFrame(() => {
    const dx = camera.position.x - position[0];
    const dy = camera.position.y - position[1];
    const dz = camera.position.z - position[2];
    const next = objectMarkerScale(
      Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2));
    setScale(current =>
      Math.abs(current - next) > 0.05 ? next : current);
  });
  return scale;
};

const faceArrowEnd = (
  start: XYZRecord,
  direction: Direction,
  scale: number,
): XYZRecord => {
  const end = { ...start };
  const length = FACE_SIZE_ARROW_LENGTH * scale;
  const diagonal = length / Math.sqrt(3);
  switch (direction) {
    case "x-": end.x -= length; break;
    case "x+": end.x += length; break;
    case "y-": end.y -= length; break;
    case "y+": end.y += length; break;
    case "z+": end.z += length; break;
    case "xyz+":
      end.x += diagonal;
      end.y += diagonal;
      end.z += diagonal;
      break;
  }
  return end;
};

const vectorLength = (
  start: XYZRecord,
  end: XYZRecord,
) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  return Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);
};

const SingleAxisIndicator = (props: SingleAxisIndicatorProps) => {
  const { start, end } = props;
  const distance = vectorLength(start, end);
  if (distance < 1) { return <></>; }
  const interactive = !!props.onPointerDown;
  return <ControlHandle
    name={props.name}
    enabled={interactive}
    onHoverChange={props.onHoverChange}
    onDragStart={({ event }) => props.onPointerDown?.(event)}
    onDrag={({ event }) => props.onPointerMove?.(event)}
    onDragEnd={({ event }) => props.onPointerUp?.(event)}
    onDragCancel={props.onPointerCancel}>
    {state => <ControlArrow
      name={`${props.name}-arrow`}
      start={[start.x, start.y, start.z]}
      end={[end.x, end.y, end.z]}
      width={CONTROL_SIZE_ARROW_WIDTH * props.scale}
      color={props.color}
      hoverColor={"deepskyblue"}
      hovered={state.hovered || props.hovered}
      enabled={interactive}
      depthTest={true}
      depthWrite={true}
      renderOrder={FACE_SIZE_RENDER_ORDER}
      label={props.label}
      labelName={`${props.name}-label`}
      labelSize={FACE_SIZE_LABEL_SIZE * props.scale}
      labelVisible={!props.hideLabel
        && (props.labelVisible
          || props.hovered
          || state.hovered
          || state.dragging)} />}
  </ControlHandle>;
};

const OriginAxisIndicator = (props: OriginAxisIndicatorProps) => {
  const { start, end } = props;
  const distance = vectorLength(start, end);
  const signedDistance = end[props.axis] - start[props.axis];
  if (distance < 1) { return <></>; }
  return <ControlArrow
    name={props.name}
    start={[start.x, start.y, start.z]}
    end={[end.x, end.y, end.z]}
    heads={"both"}
    colorType={props.axis}
    width={CONTROL_ARROW_WIDTH * props.scale}
    renderOnTop={true}
    renderOrder={ORIGIN_MARKER_RENDER_ORDER}
    label={`${signedDistance.toFixed(0)}mm`}
    labelName={`${props.name}-label`}
    labelSize={ORIGIN_LABEL_SIZE * props.scale}
    labelDepthTest={false}
    labelDepthWrite={false}
    labelRenderOrder={ORIGIN_MARKER_RENDER_ORDER}
    labelVisible={props.labelVisible} />;
};

const ObjectBaseAxes = (props: ObjectBaseAxesProps) => {
  const { config, center, dispatch, sceneObject, onPreview, onPreviewEnd } =
    props;
  const [hoveredAxis, setHoveredAxis] = React.useState<AxisName>();
  const [axisDrag, setAxisDrag] = React.useState<AxisDragState>();
  const getGardenPosition = React.useMemo(
    () => getGardenPositionFunc(config),
    [config]);
  const position = sceneObjectPoint(config, center);
  const start = pointToRecord(position);
  const scale = useObjectMarkerScale(position);
  const markerRadius = ORIGIN_MARKER_RADIUS * scale;
  const arrowLength = OBJECT_AXIS_ARROW_LENGTH * scale;
  const updateSceneObject = React.useCallback((
    update: Partial<TaggedSceneObject["body"]>,
  ) => {
    if (!dispatch) { return; }
    const resource = sceneObject as unknown as TaggedResource;
    dispatch(edit(resource, update));
    dispatch(save(sceneObject.uuid));
  }, [dispatch, sceneObject]);
  const axisMoveUpdate = (
    e: ControlDragEvent,
  ): Partial<TaggedSceneObject["body"]> => {
    if (!axisDrag) { return {}; }
    if (axisDrag.axis == "z") {
      const z = axisDrag.startZ
        + e.point.z - axisDrag.startParameter;
      return {
        z_base: snapToGrid(adjustCenter(
          config, sceneObject.body, { ...center, z }).z)
      };
    }
    const gardenPosition = getGardenPosition(e.point);
    if (axisDrag.axis == "x") {
      const x = gardenPosition.x + axisDrag.offset;
      return {
        x_center: snapToGrid(adjustCenter(
          config, sceneObject.body, { ...center, x }).x)
      };
    }
    const y = gardenPosition.y + axisDrag.offset;
    return {
      y_center: snapToGrid(adjustCenter(
        config, sceneObject.body, { ...center, y }).y)
    };
  };
  const axes = [
    {
      name: "x",
      start: { ...start, x: start.x + markerRadius },
      end: {
        ...start,
        x: start.x + markerRadius + arrowLength,
      },
    },
    {
      name: "y",
      start: { ...start, y: start.y + markerRadius },
      end: {
        ...start,
        y: start.y + markerRadius + arrowLength,
      },
    },
    {
      name: "z",
      start: { ...start, z: start.z + markerRadius },
      end: {
        ...start,
        z: start.z + markerRadius + arrowLength,
      },
    },
  ];
  return <Group
    name={"scene-object-base-axes"}
    renderOrder={ORIGIN_MARKER_RENDER_ORDER}>
    <ControlHandle
      name={"scene-object-base-marker-control"}
      canStart={() => false}>
      {state => <ControlSphere
        name={"scene-object-base-marker"}
        radius={markerRadius}
        colorType={"origin"}
        hovered={state.hovered}
        renderOnTop={true}
        renderOrder={ORIGIN_SPHERE_RENDER_ORDER}
        position={position} />}
    </ControlHandle>
    {axes.map(axis =>
      <ControlHandle
        key={axis.name}
        name={`scene-object-base-${axis.name}-axis-arrow`}
        constraint={axisConstraint(
          axis.name as AxisName,
          [axis.start.x, axis.start.y, axis.start.z],
        )}
        onHoverChange={hovered => {
          const field = centerFieldFromAxis(axis.name as AxisName);
          if (props.interactionLocked()) { return; }
          if (axisDrag) { return; }
          setHoveredAxis(hovered ? axis.name as AxisName : undefined);
          props.onActiveAxisChange(
            hovered ? axis.name as AxisName : undefined,
          );
          setSceneObjectFieldFocus(dispatch, hovered ? field : undefined);
        }}
        onDragStart={event => {
          const field = centerFieldFromAxis(axis.name as AxisName);
          const gardenPosition = getGardenPosition(event.point);
          setAxisDrag({
            axis: axis.name as AxisName,
            offset: axis.name == "x"
              ? center.x - gardenPosition.x
              : center.y - gardenPosition.y,
            startParameter: axis.name == "z"
              ? event.point.z
              : 0,
            startZ: center.z,
          });
          props.setInteractionLocked(true);
          props.onActiveAxisChange(axis.name as AxisName);
          setSceneObjectFieldFocus(dispatch, field);
          onPreview({});
        }}
        onDrag={event => {
          if (!axisDrag || axisDrag.axis != axis.name) { return; }
          onPreview(axisMoveUpdate(event));
        }}
        onDragEnd={event => {
          if (!axisDrag || axisDrag.axis != axis.name) { return; }
          updateSceneObject(axisMoveUpdate(event));
          setAxisDrag(undefined);
          props.setInteractionLocked(false);
          props.onActiveAxisChange(undefined);
          setSceneObjectFieldFocus(dispatch, undefined);
          onPreviewEnd();
        }}
        onDragCancel={() => {
          if (!axisDrag || axisDrag.axis != axis.name) { return; }
          setAxisDrag(undefined);
          props.setInteractionLocked(false);
          props.onActiveAxisChange(undefined);
          setSceneObjectFieldFocus(dispatch, undefined);
          onPreviewEnd();
        }}>
        {state => <ControlArrow
          name={`scene-object-base-${axis.name}-axis-arrow-shape`}
          start={[axis.start.x, axis.start.y, axis.start.z]}
          end={[axis.end.x, axis.end.y, axis.end.z]}
          colorType={axis.name as AxisName}
          renderOnTop={true}
          hovered={state.hovered || hoveredAxis == axis.name}
          renderOrder={OBJECT_AXIS_RENDER_ORDER}
          width={CONTROL_ARROW_WIDTH * scale} />}
      </ControlHandle>)}
  </Group>;
};

const SceneObjectOriginMarkers = (props: SceneObjectOriginMarkersProps) => {
  const { focusedField, config, sceneObject, center } = props;
  const [activeAxis, setActiveAxis] = React.useState<AxisName>();
  const { x_origin, y_origin, z_origin } = sceneObject.body;
  const xOrigin = originX(config, x_origin);
  const yOrigin = originY(config, y_origin);
  const zOrigin = originZ(config, z_origin);
  const objectBase = sceneObjectPoint(config, center);
  const scale = useObjectMarkerScale(objectBase);
  const markers: OriginMarker[] = [
    {
      name: "z",
      position: sceneObjectPoint(config, {
        x: center.x,
        y: center.y,
        z: zOrigin,
      }),
    },
    {
      name: "y",
      position: sceneObjectPoint(config, {
        x: center.x,
        y: yOrigin,
        z: zOrigin,
      }),
      arrowStart: sceneObjectPoint(config, {
        x: center.x,
        y: yOrigin,
        z: zOrigin,
      }),
      arrowEnd: sceneObjectPoint(config, {
        x: center.x,
        y: center.y,
        z: zOrigin,
      }),
    },
    {
      name: "x",
      showSphere: true,
      position: sceneObjectPoint(config, {
        x: xOrigin,
        y: yOrigin,
        z: zOrigin,
      }),
      arrowStart: sceneObjectPoint(config, {
        x: xOrigin,
        y: yOrigin,
        z: zOrigin,
      }),
      arrowEnd: sceneObjectPoint(config, {
        x: center.x,
        y: yOrigin,
        z: zOrigin,
      }),
    },
  ];
  return <>
    <ObjectBaseAxes {...props} onActiveAxisChange={setActiveAxis} />
    {markers.map(marker => {
      const [x, y, z] = marker.arrowStart || marker.position;
      const [endX, endY, endZ] = marker.arrowEnd || objectBase;
      const start = { x, y, z };
      const end = { x: endX, y: endY, z: endZ };
      return <React.Fragment key={marker.name}>
        <OriginAxisIndicator
          name={`scene-object-${marker.name}-origin-arrow`}
          axis={marker.name as AxisName}
          scale={scale}
          labelVisible={originLabelVisible(
            focusedField,
            marker.name as AxisName,
            props.bodyDragging) ||
            activeAxis == marker.name}
          start={start}
          end={end} />
        {marker.showSphere &&
          <ControlSphere
            name={`scene-object-${marker.name}-origin-marker`}
            radius={ORIGIN_MARKER_RADIUS * scale}
            colorType={"origin"}
            renderOnTop={true}
            renderOrder={ORIGIN_SPHERE_RENDER_ORDER}
            position={marker.position} />}
      </React.Fragment>;
    })}
  </>;
};

interface SceneObjectOpacityProps {
  show: boolean;
  opacity?: number;
  visible?: boolean;
  onClick?(e: ThreeEvent<MouseEvent>): void;
  children: React.ReactNode;
}

interface SceneObjectShadowState {
  castShadow: boolean;
  receiveShadow: boolean;
}

export const applySceneObjectOpacity = (
  shadowStates: WeakMap<Object3D, SceneObjectShadowState>,
  materialStates: WeakMap<Object3D, Material | Material[]>,
  opaque: boolean,
  opacity: number,
  object: Object3D,
) => {
  if (!shadowStates.has(object)) {
    shadowStates.set(object, {
      castShadow: object.castShadow,
      receiveShadow: object.receiveShadow,
    });
  }
  const shadowState = shadowStates.get(object);
  object.castShadow = opaque ? !!shadowState?.castShadow : false;
  object.receiveShadow = opaque ? !!shadowState?.receiveShadow : false;
  const renderedObject = object as Object3D & {
    material?: Material | Material[];
  };
  if (!renderedObject.material) { return; }
  if (!materialStates.has(object)) {
    materialStates.set(object, renderedObject.material);
  }
  const original = materialStates.get(object);
  if (!original) { return; }
  if (opaque) {
    renderedObject.material = original;
  } else {
    const translucent = (Array.isArray(original) ? original : [original])
      .map(material => {
        const clone = material.clone();
        clone.opacity = material.opacity * opacity;
        clone.transparent = true;
        return clone;
      });
    renderedObject.material = Array.isArray(original)
      ? translucent
      : translucent[0];
  }
};

const SceneObjectOpacity = (props: SceneObjectOpacityProps) => {
  const opacity = props.opacity ?? (props.show ? 1 : 0.75);
  const opaque = props.show && opacity >= 1;
  // eslint-disable-next-line no-null/no-null
  const group = React.useRef<ThreeGroup>(null);
  const shadowStates = React.useRef(
    new WeakMap<Object3D, SceneObjectShadowState>());
  const materialStates = React.useRef(
    new WeakMap<Object3D, Material | Material[]>());
  React.useLayoutEffect(() => {
    group.current?.traverse(applySceneObjectOpacity.bind(
      undefined,
      shadowStates.current,
      materialStates.current,
      opaque,
      opacity,
    ));
  }, [opaque, opacity, props.visible]);
  return <Group
    name={"scene-object-opacity"}
    ref={group}
    visible={props.visible ?? true}
    onClick={props.onClick}>
    {props.children}
  </Group>;
};

export const SceneObjects = (props: SceneObjectsProps) => {
  const selectedSceneObjectId = Number(Path.getSlug(Path.sceneObjects()));
  const hasSelectedSceneObject = !isNaN(selectedSceneObjectId);
  const popupSceneObjectSelection = props.selection?.kind == "sceneObject"
    ? props.selection
    : undefined;
  const [dragPreview, setDragPreview] =
    React.useState<SceneObjectDragPreview>();
  const [bodyDragging, setBodyDragging] = React.useState<string>();
  const interactionLocked = React.useRef(false);
  const getInteractionLocked = React.useCallback(
    () => interactionLocked.current,
    []);
  const setInteractionLocked = React.useCallback((locked: boolean) => {
    interactionLocked.current = locked;
  }, []);
  const featuredSceneObjects = props.designer?.featuredScene
    ? staticSceneObjects(props.designer.featuredScene)
    : undefined;
  const featuredUuids = new Set(featuredSceneObjects?.map(({ uuid }) => uuid));
  const userSceneObjectUuids = new Set(
    props.sceneObjects?.map(({ uuid }) => uuid));
  const hoverAllUserSceneObjects = props.designer?.hoveredSceneObject
    == HOVER_ALL_SCENE_OBJECTS;
  const sceneObjects = (props.sceneObjects || []).concat(
    featuredSceneObjects
    || staticSceneObjects(props.config.scene,
      props.isPromo && !props.config.outdoorObjects));
  const shownSceneObjects = sceneObjects.filter(
    sceneObject => sceneObject.body.show);
  return <>
    {/* eslint-disable-next-line complexity */}
    {shownSceneObjects.map(sceneObject => {
      const selectedFromPopup = !!popupSceneObjectSelection
        && (popupSceneObjectSelection.id == sceneObject.body.id
          || popupSceneObjectSelection.uuid == sceneObject.uuid);
      const selectedFromRoute = hasSelectedSceneObject
        && sceneObject.body.id === selectedSceneObjectId;
      const selected = popupSceneObjectSelection
        ? selectedFromPopup
        : selectedFromRoute;
      const hovered = (hoverAllUserSceneObjects
        && userSceneObjectUuids.has(sceneObject.uuid))
        || (props.hoverSelection?.kind == "sceneObject"
          && (props.hoverSelection.id == sceneObject.body.id
            || props.hoverSelection.uuid == sceneObject.uuid));
      const visible = (props.visible && sceneObject.body.show)
        || selected || hovered;
      const opacity = featuredUuids.has(sceneObject.uuid) ? 0.5 : undefined;
      const previewedSceneObject =
        selected
          ? sceneObjectWithDragPreview(sceneObject, dragPreview)
          : sceneObject;
      const show = props.visible && previewedSceneObject.body.show;
      const { texture, shape } = previewedSceneObject.body;
      const { x_size, y_size, z_size, color } = previewedSceneObject.body;
      const bounds = boundsFromSceneObject(previewedSceneObject, props.config);
      const center = reCenter(props.config, previewedSceneObject);
      const position = sceneObjectPosition(props.config, previewedSceneObject);
      const rotation = sceneObjectRotation(
        previewedSceneObject.body.rotation);
      const preview = (update: Partial<TaggedSceneObject["body"]>) =>
        setDragPreview({ uuid: sceneObject.uuid, update });
      const size: [number, number, number] = [x_size, y_size, z_size];
      const endPreview = () => setDragPreview(undefined);
      const selectSceneObject = (event: ThreeEvent<MouseEvent>) => {
        if (!props.onSelectObject
          || !sceneObject.body.id
          || clickWasDragged(event)) {
          return;
        }
        event.stopPropagation();
        props.onSelectObject({
          kind: "sceneObject",
          id: sceneObject.body.id,
        });
      };
      const renderHoverEdges = (
        edgePosition: [number, number, number],
        edgeSize = size,
        edgeRotation?: [number, number, number],
      ) =>
        hovered && !selected &&
        <Box
          args={edgeSize}
          position={edgePosition}
          rotation={edgeRotation}>
          <MeshBasicMaterial
            color={"white"}
            transparent={true}
            opacity={0}
            depthTest={false} />
          <Edges color={"white"} lineWidth={EDGE_LINE_WIDTH} />
        </Box>;
      const renderMoveHandle = (
        handlePosition: [number, number, number],
        handleSize = size,
        handleRotation?: [number, number, number],
      ) =>
        selected &&
        <SceneObjectMoveHandle
          config={props.config}
          dispatch={props.dispatch}
          sceneObject={sceneObject}
          showBottomEdge={previewedSceneObject.body.z_base == 0}
          args={handleSize}
          position={handlePosition}
          rotation={handleRotation}
          setInteractionLocked={setInteractionLocked}
          onPreview={preview}
          onPreviewEnd={endPreview}
          onDragStateChange={dragging =>
            setBodyDragging(dragging ? sceneObject.uuid : undefined)} />;
      const renderSelectionMarkers = () =>
        selected &&
        <>
          <SceneObjectOriginMarkers
            focusedField={props.designer?.focusedSceneObjectField || ""}
            config={props.config}
            sceneObject={previewedSceneObject}
            center={center}
            dispatch={props.dispatch}
            interactionLocked={getInteractionLocked}
            setInteractionLocked={setInteractionLocked}
            onPreview={preview}
            onPreviewEnd={endPreview}
            bodyDragging={bodyDragging == sceneObject.uuid} />
          <SceneObjectSelectionMarkers
            focusedField={props.designer?.focusedSceneObjectField || ""}
            config={props.config}
            dispatch={props.dispatch}
            sceneObject={previewedSceneObject}
            bounds={bounds}
            center={center}
            interactionLocked={getInteractionLocked}
            setInteractionLocked={setInteractionLocked}
            unifiedSize={
              props.designer?.unifiedSceneObjectSize == sceneObject.uuid}
            onPreview={preview}
            onPreviewEnd={endPreview} />
          <SceneObjectRotationControl
            config={props.config}
            dispatch={props.dispatch}
            focusedField={
              props.designer?.focusedSceneObjectField || ""}
            sceneObject={previewedSceneObject}
            bounds={bounds}
            center={center}
            interactionLocked={getInteractionLocked}
            setInteractionLocked={setInteractionLocked}
            onPreview={preview}
            onPreviewEnd={endPreview} />
        </>;

      if (shape === "plant") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <PottedPlant size={[x_size, y_size, z_size]} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "tray") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <StarterTray size={[x_size, y_size, z_size]} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "laptop") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Laptop size={[x_size, y_size, z_size]} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "desk") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Desk size={[x_size, y_size, z_size]}
              texture={texture}
              color={color}
              activeFocus={props.activeFocus} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "solar") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Solar size={size} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "tree") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Tree size={size} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "fence") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Fence size={size} texture={texture} color={color} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "astronaut") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Astronaut size={size} texture={texture} color={color} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "rover") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Rover size={size} texture={texture} color={color} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "hab") {
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group position={position} rotation={rotation}>
            <Hab size={size} texture={texture} color={color} />
            {renderMoveHandle([0, 0, 0])}
            {renderHoverEdges([0, 0, 0])}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      if (shape === "window") {
        const wall = greenhouseWallRenderProps(x_size, y_size, z_size);
        const wallRotation: [number, number, number] = [
          0,
          0,
          wall.rotation[2] + rotation[2],
        ];
        return <SceneObjectOpacity key={sceneObject.uuid}
          opacity={opacity}
          onClick={selectSceneObject}
          show={show}
          visible={visible}>
          <Group
            position={position}
            rotation={wallRotation}>
            <GreenhouseWall size={wall.size} />
            {renderMoveHandle([0, 0, 0], wall.size)}
            {renderHoverEdges([0, 0, 0], wall.size)}
          </Group>
          {renderSelectionMarkers()}
        </SceneObjectOpacity>;
      }

      const textureUrl = texture === "none" ? undefined : ASSETS.textures[texture];
      return <SceneObjectOpacity key={sceneObject.uuid}
        opacity={opacity}
        onClick={selectSceneObject}
        show={show}
        visible={visible}>
        <SceneObjectBox
          config={props.config}
          sceneObject={previewedSceneObject}
          textureUrl={textureUrl}
          width={x_size}
          depth={y_size}
          height={z_size}
          color={color}
          shape={shape} />
        {renderMoveHandle(position, size, rotation)}
        {renderHoverEdges(position, size, rotation)}
        {renderSelectionMarkers()}
      </SceneObjectOpacity>;
    })}
  </>;
};

export const staticSceneObjects = (
  scene: string,
  hideOutdoorObjects?: boolean,
): TaggedSceneObject[] => {
  const wrap = (sceneObjects: SceneObject[]): TaggedSceneObject[] =>
    sceneObjects.map((body, index) => ({
      kind: "SceneObject",
      body,
      uuid: `SceneObject.static.${scene}.${index}`,
      specialStatus: SpecialStatus.SAVED,
    }));
  switch (scene) {
    case "Outdoor":
      if (hideOutdoorObjects) { return []; }
      return wrap(OUTDOOR_SCENE_OBJECTS);
    case "Lab":
      return wrap(LAB_SCENE_OBJECTS);
    case "Greenhouse":
      return wrap(GREENHOUSE_SCENE_OBJECTS);
    case "Mars":
      return wrap(MARS_SCENE_OBJECTS);
    default:
      return [];
  }
};

interface SceneObjectPreviewProps {
  config: Config;
  opacity?: number;
  sceneObject: SceneObject;
}

export const sceneObjectAppearanceKey = (sceneObject: SceneObject) =>
  [sceneObject.shape, sceneObject.texture, sceneObject.color].join("-");

export const greenhouseWallRenderProps = (
  xSize: number,
  ySize: number,
  zSize: number,
): { size: [number, number, number]; rotation: [number, number, number] } => {
  const alongY = ySize > xSize;
  return {
    size: (alongY
      ? [ySize, xSize, zSize]
      : [xSize, ySize, zSize]),
    rotation: (alongY
      ? [0, 0, Math.PI / 2]
      : [0, 0, 0]),
  };
};

export const SceneObjectPreview = (props: SceneObjectPreviewProps) =>
  <SceneObjectOpacity
    key={sceneObjectAppearanceKey(props.sceneObject)}
    show={props.sceneObject.show}
    opacity={props.opacity}>
    <SceneObjectPreviewContent {...props} />
  </SceneObjectOpacity>;

const SceneObjectPreviewContent = (props: SceneObjectPreviewProps) => {
  const { shape, x_size, y_size, z_size, texture, color } = props.sceneObject;
  const sceneObject = {
    uuid: "scene-object-placement-preview-resource",
    body: props.sceneObject,
  } as TaggedSceneObject;
  const position = sceneObjectPosition(props.config, sceneObject);
  const rotation = sceneObjectRotation(props.sceneObject.rotation);

  if (shape === "plant") {
    return <Group position={position} rotation={rotation}>
      <PottedPlant size={[x_size, y_size, z_size]} />
    </Group>;
  }

  if (shape === "tray") {
    return <Group position={position} rotation={rotation}>
      <StarterTray size={[x_size, y_size, z_size]} />
    </Group>;
  }

  if (shape === "window") {
    const wall = greenhouseWallRenderProps(x_size, y_size, z_size);
    const wallRotation: [number, number, number] = [
      0,
      0,
      wall.rotation[2] + rotation[2],
    ];
    return <Group position={position} rotation={wallRotation}>
      <GreenhouseWall size={wall.size} />
    </Group>;
  }

  if (shape === "laptop") {
    return <Group position={position} rotation={rotation}>
      <Laptop size={[x_size, y_size, z_size]} />
    </Group>;
  }

  if (shape === "desk") {
    return <Group position={position} rotation={rotation}>
      <Desk size={[x_size, y_size, z_size]}
        texture={texture}
        color={color}
        activeFocus={""} />
    </Group>;
  }

  if (shape === "solar") {
    return <Group position={position} rotation={rotation}>
      <Solar size={[x_size, y_size, z_size]} />
    </Group>;
  }

  if (shape === "tree") {
    return <Group position={position} rotation={rotation}>
      <Tree size={[x_size, y_size, z_size]} />
    </Group>;
  }

  if (shape === "fence") {
    return <Group position={position} rotation={rotation}>
      <Fence size={[x_size, y_size, z_size]}
        texture={texture}
        color={color} />
    </Group>;
  }

  if (shape === "astronaut") {
    return <Group position={position} rotation={rotation}>
      <Astronaut size={[x_size, y_size, z_size]}
        texture={texture}
        color={color} />
    </Group>;
  }

  if (shape === "hab") {
    return <Group position={position} rotation={rotation}>
      <Hab size={[x_size, y_size, z_size]}
        texture={texture}
        color={color} />
    </Group>;
  }

  if (shape === "rover") {
    return <Group position={position} rotation={rotation}>
      <Rover size={[x_size, y_size, z_size]}
        texture={texture}
        color={color} />
    </Group>;
  }

  return <SceneObjectBox
    config={props.config}
    sceneObject={sceneObject}
    textureUrl={texture === "none" ? undefined : ASSETS.textures[texture]}
    width={x_size}
    depth={y_size}
    height={z_size}
    color={color}
    shape={shape} />;
};

interface SceneObjectBoxProps {
  config: Config;
  sceneObject: TaggedSceneObject;
  textureUrl: string | undefined;
  width: number;
  depth: number;
  height: number;
  shape: string;
  color: string;
}

const SceneObjectBox = (props: SceneObjectBoxProps) => {
  const url = props.textureUrl || ASSETS.textures.concrete;
  const texture = useTextureVariant(url, {});
  const rotatedTexture = useTextureVariant(url, {
    rotation: Math.PI / 2,
    offset: [0, 1],
  });
  const position = sceneObjectPosition(props.config, props.sceneObject);
  const rotation = sceneObjectRotation(props.sceneObject.body.rotation);
  const materialKey = props.textureUrl || "none";
  const materialProps = {
    map: props.textureUrl ? texture : undefined,
    color: props.color,
    side: DoubleSide,
  };

  if (props.shape === "cylinder") {
    return <Cylinder
      castShadow={true}
      receiveShadow={true}
      position={position}
      rotation={[Math.PI / 2, 0, rotation[2]]}
      scale={[props.width, props.height, props.depth]}
      args={[0.5, 0.5, 1, 32]}>
      <MeshPhongMaterial key={materialKey} {...materialProps} />
    </Cylinder>;
  }

  if (props.shape === "sphere") {
    return <Sphere
      castShadow={true}
      receiveShadow={true}
      position={position}
      rotation={rotation}
      scale={[props.width, props.depth, props.height]}
      args={[0.5, 32, 32]}>
      <MeshPhongMaterial key={materialKey} {...materialProps} />
    </Sphere>;
  }

  if (props.textureUrl === ASSETS.textures.bricks) {
    return <Box
      castShadow={true}
      receiveShadow={true}
      position={position}
      rotation={rotation}
      args={[props.width, props.depth, props.height]}>
      {range(6).map(faceIndex =>
        <MeshPhongMaterial
          attach={`material-${faceIndex}`}
          key={`${materialKey}-${faceIndex}`}
          map={faceIndex < 2 ? rotatedTexture : texture}
          color={props.color} />)}
    </Box>;
  }

  return <Box
    castShadow={true}
    receiveShadow={true}
    position={position}
    rotation={rotation}
    args={[props.width, props.depth, props.height]}>
    <MeshPhongMaterial key={materialKey} {...materialProps} />
  </Box>;
};
