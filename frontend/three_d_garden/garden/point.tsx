import React from "react";
import { SpecialStatus, TaggedGenericPointer, Xyz } from "farmbot";
import { Config } from "../config";
import {
  Group, InstancedMesh, MeshPhongMaterial,
} from "../components";
import { Cylinder, Sphere, Torus } from "@react-three/drei";
import {
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  InstancedMesh as InstancedMeshType,
  Matrix4,
  Mesh as ThreeMesh,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from
  "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ThreeEvent } from "@react-three/fiber";
import { getWorldPositionFunc } from "../helpers";
import { useNavigate } from "react-router";
import { Path } from "../../internal_urls";
import { isUndefined, round } from "lodash";
import { setPanelOpen3D } from "../panel_actions";
import {
  DesignerState, ThreeDDesignerState,
} from "../../farm_designer/interfaces";
import { getMode } from "../../farm_designer/map/util";
import { Mode } from "../../farm_designer/map/interfaces";
import { WeedBase } from ".";
import { HOVER_OBJECT_MODES, RenderOrder } from "../constants";
import {
  BillboardRef, ImageRef, RadiusRef, TorusRef,
} from "../bed/objects/pointer_objects";
import { clickWasDragged } from "../click_event";
import {
  ThreeDObjectHoverHandler, ThreeDObjectHoverLabelHandler,
  ThreeDObjectSelection,
  ThreeDObjectSelectionHandler,
} from "../selection_types";
import {
  MARKER_SPHERE_SEGMENTS,
  RADIUS_TORUS_SEGMENTS,
} from "./geometry_detail";

export const POINT_PIN_RADIUS = 12.5;
export const POINT_PIN_HEIGHT = 50;
const POINT_CYLINDER_HEIGHT = 25;
const POINT_CYLINDER_INNER_R_FRACTION = 0.95;
const POINT_CYLINDER_TUBE_SIZE = 1 - POINT_CYLINDER_INNER_R_FRACTION;
export const POINT_CYLINDER_SCALE_FACTOR =
  round(1 / POINT_CYLINDER_TUBE_SIZE ** 2);

const stopPropagationForSelectedPoint = (
  event: ThreeEvent<MouseEvent>,
  onSelectObject: ThreeDObjectSelectionHandler,
  selection: ThreeDObjectSelection,
) =>
  onSelectObject(selection) !== false && event.stopPropagation?.();

const makePointMarkerGeometry = () => {
  const pinGeometry = new CylinderGeometry(
    POINT_PIN_RADIUS,
    0,
    POINT_PIN_HEIGHT,
    16,
    2,
    true,
  );
  pinGeometry.rotateX(Math.PI / 2);
  pinGeometry.translate(0, 0, POINT_PIN_HEIGHT / 2);
  const sphereGeometry = new SphereGeometry(
    POINT_PIN_RADIUS,
    ...MARKER_SPHERE_SEGMENTS,
  );
  sphereGeometry.translate(0, 0, POINT_PIN_HEIGHT);
  const markerGeometry = mergeGeometries(
    [pinGeometry, sphereGeometry],
    false,
  ) || new BufferGeometry();
  pinGeometry.dispose();
  sphereGeometry.dispose();
  return markerGeometry;
};

let pointMarkerGeometry: BufferGeometry | undefined = undefined;
const getPointMarkerGeometry = () => {
  pointMarkerGeometry ||= makePointMarkerGeometry();
  return pointMarkerGeometry;
};

let pointRadiusGeometry: BufferGeometry | undefined = undefined;
const getPointRadiusGeometry = () => {
  pointRadiusGeometry ||= new TorusGeometry(
    1,
    POINT_CYLINDER_TUBE_SIZE,
    ...RADIUS_TORUS_SEGMENTS,
  );
  return pointRadiusGeometry;
};

export interface PointProps {
  point: TaggedGenericPointer;
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
}

export const Point = (props: PointProps) => {
  const { point, config } = props;
  const navigate = useNavigate();
  const unsaved = point.specialStatus !== SpecialStatus.SAVED;
  const pointId = point.body.id;
  return <PointBase
    pointName={"" + point.body.id}
    alpha={unsaved ? 0.5 : 1}
    position={{
      x: point.body.x,
      y: point.body.y,
      z: props.getZ(point.body.x, point.body.y),
    }}
    onClick={(event) => {
      if (clickWasDragged(event)) { return; }
      if (point.body.id && (props.dispatch || props.onSelectObject) &&
        props.visible &&
        ![...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
        if (props.onSelectObject) {
          stopPropagationForSelectedPoint(event, props.onSelectObject, {
            kind: "point", id: point.body.id,
          });
          return;
        }
        event.stopPropagation?.();
        props.dispatch?.(setPanelOpen3D(true));
        navigate(Path.points(point.body.id));
      }
    }}
    config={config}
    color={point.body.meta.color}
    radius={point.body.radius}
    onHoverObject={props.onHoverObject}
    onHoverLabel={pointId
      ? hovered => props.onHoverLabel?.(hovered
        ? { kind: "point", id: pointId }
        : undefined)
      : undefined}
  />;
};

interface PointInstance {
  point: TaggedGenericPointer;
  position: [number, number, number];
  radius: number;
}

interface PointInstanceGroup {
  color: string | undefined;
  alpha: number;
  points: PointInstance[];
  ringPoints: PointInstance[];
}

export interface PointInstancesProps {
  points: TaggedGenericPointer[];
  config: Config;
  dispatch?: Function;
  visible: boolean;
  getZ(x: number, y: number): number;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
}

const pointAlpha = (point: TaggedGenericPointer) =>
  point.specialStatus !== SpecialStatus.SAVED ? 0.5 : 1;

const pointBucketKey = (point: TaggedGenericPointer) =>
  `${point.body.meta.color || ""}-${pointAlpha(point)}`;

const getPointInstanceGroups = (
  points: TaggedGenericPointer[],
  config: Config,
  getZ: (x: number, y: number) => number,
) => {
  const getWorldPosition = getWorldPositionFunc(config);
  const groups: Record<string, PointInstanceGroup> = {};
  points.forEach(point => {
    const alpha = pointAlpha(point);
    const key = pointBucketKey(point);
    const instance = {
      point,
      position: getWorldPosition({
        x: point.body.x,
        y: point.body.y,
        z: getZ(point.body.x, point.body.y),
      }),
      radius: point.body.radius,
    };
    groups[key] ||= {
      color: point.body.meta.color,
      alpha,
      points: [],
      ringPoints: [],
    };
    groups[key].points.push(instance);
    if (point.body.radius > 0) { groups[key].ringPoints.push(instance); }
  });
  return Object.values(groups);
};

interface PointInstanceBucketProps extends PointInstancesProps {
  group: PointInstanceGroup;
}

const PointBucketInstances = (props: PointInstanceBucketProps) => {
  const { group, dispatch, visible } = props;
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const markerRef = React.useRef<InstancedMeshType>(null);
  // eslint-disable-next-line no-null/no-null
  const ringRef = React.useRef<InstancedMeshType>(null);
  const markerGeometry = getPointMarkerGeometry();
  const radiusGeometry = getPointRadiusGeometry();
  const tempMatrix = React.useMemo(() => new Matrix4(), []);
  const tempPosition = React.useMemo(() => new Vector3(), []);
  const noRotation = React.useMemo(() => new Quaternion(), []);
  const noScale = React.useMemo(() => new Vector3(1, 1, 1), []);
  const ringScale = React.useMemo(() => new Vector3(), []);

  React.useLayoutEffect(() => {
    const markerMesh = markerRef.current;
    if (!markerMesh?.setMatrixAt) { return; }
    group.points.forEach((instance, index) => {
      const [x, y, z] = instance.position;
      tempPosition.set(x, y, z);
      tempMatrix.compose(tempPosition, noRotation, noScale);
      markerMesh.setMatrixAt(index, tempMatrix);
    });
    markerMesh.instanceMatrix.needsUpdate = true;
  }, [
    group.points,
    noRotation,
    noScale,
    tempMatrix,
    tempPosition,
  ]);

  React.useLayoutEffect(() => {
    const ringMesh = ringRef.current;
    if (!ringMesh?.setMatrixAt) { return; }
    group.ringPoints.forEach((instance, index) => {
      const [x, y, z] = instance.position;
      tempPosition.set(x, y, z);
      ringScale.set(
        instance.radius,
        instance.radius,
        POINT_CYLINDER_SCALE_FACTOR,
      );
      tempMatrix.compose(tempPosition, noRotation, ringScale);
      ringMesh.setMatrixAt(index, tempMatrix);
    });
    ringMesh.instanceMatrix.needsUpdate = true;
  }, [
    group.ringPoints,
    noRotation,
    ringScale,
    tempMatrix,
    tempPosition,
  ]);

  const onClick = (instances: PointInstance[]) =>
    (event: ThreeEvent<MouseEvent>) => {
      if (clickWasDragged(event)) { return; }
      const instanceId = event.instanceId;
      if (isUndefined(instanceId)) { return; }
      const point = instances[instanceId]?.point;
      if (point?.body.id && (dispatch || props.onSelectObject) && visible &&
        ![...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
        if (props.onSelectObject) {
          stopPropagationForSelectedPoint(event, props.onSelectObject, {
            kind: "point", id: point.body.id,
          });
          return;
        }
        event.stopPropagation?.();
        dispatch?.(setPanelOpen3D(true));
        navigate(Path.points(point.body.id));
      }
    };
  const onHover = (instances: PointInstance[], hovered: boolean) =>
    (event?: ThreeEvent<PointerEvent>) => {
      props.onHoverObject?.(hovered);
      const instanceId = event?.instanceId;
      if (!hovered || isUndefined(instanceId)) {
        props.onHoverLabel?.(undefined);
        return;
      }
      const id = instances[instanceId]?.point.body.id;
      props.onHoverLabel?.(id ? { kind: "point", id } : undefined);
    };

  return <>
    <InstancedMesh
      ref={markerRef}
      name={"marker"}
      args={[markerGeometry, undefined, group.points.length]}
      // eslint-disable-next-line no-null/no-null
      dispose={null}
      visible={visible}
      onClick={onClick(group.points)}
      onPointerOver={onHover(group.points, true)}
      onPointerOut={onHover(group.points, false)}
      renderOrder={RenderOrder.points}>
      <MeshPhongMaterial
        color={group.color}
        side={DoubleSide}
        transparent={group.alpha < 1}
        depthWrite={group.alpha == 1}
        opacity={group.alpha} />
    </InstancedMesh>
    {group.ringPoints.length > 0 &&
      <InstancedMesh
        ref={ringRef}
        name={"marker-radius"}
        args={[radiusGeometry, undefined, group.ringPoints.length]}
        // eslint-disable-next-line no-null/no-null
        dispose={null}
        visible={visible}
        onClick={onClick(group.ringPoints)}
        onPointerOver={onHover(group.ringPoints, true)}
        onPointerOut={onHover(group.ringPoints, false)}
        renderOrder={RenderOrder.points}>
        <MeshPhongMaterial
          color={group.color}
          transparent={true}
          depthWrite={false}
          opacity={0.5 * group.alpha} />
      </InstancedMesh>}
  </>;
};

const pointPositionConfigEquals = (a: Config, b: Config) =>
  a.bedLengthOuter == b.bedLengthOuter &&
  a.bedWidthOuter == b.bedWidthOuter &&
  a.bedXOffset == b.bedXOffset &&
  a.bedYOffset == b.bedYOffset &&
  a.columnLength == b.columnLength &&
  a.zGantryOffset == b.zGantryOffset &&
  a.mirrorX == b.mirrorX &&
  a.mirrorY == b.mirrorY;

const pointInstancesPropsEqual = (
  prev: PointInstancesProps,
  next: PointInstancesProps,
) =>
  prev.points == next.points &&
  prev.visible == next.visible &&
  prev.getZ == next.getZ &&
  prev.dispatch == next.dispatch &&
  prev.onSelectObject == next.onSelectObject &&
  prev.onHoverObject == next.onHoverObject &&
  prev.onHoverLabel == next.onHoverLabel &&
  pointPositionConfigEquals(prev.config, next.config);

export const PointInstances = React.memo((props: PointInstancesProps) => {
  if (!props.visible) { return <></>; }
  return <VisiblePointInstances {...props} />;
}, pointInstancesPropsEqual);

const VisiblePointInstances = (props: PointInstancesProps) => {
  const groups = React.useMemo(
    () => getPointInstanceGroups(props.points, props.config, props.getZ),
    [props.points, props.config, props.getZ]);
  return <>
    {groups.map(group =>
      <PointBucketInstances
        key={`${group.color || ""}-${group.alpha}`}
        {...props}
        group={group} />)}
  </>;
};

export interface DrawnPointProps {
  designer: ThreeDDesignerState;
  usePosition: boolean;
  config: Config;
  getZ?(x: number, y: number): number;
  radiusRef?: RadiusRef;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
}

interface DrawnPointPreviewProps extends DrawnPointProps {
  mode: Mode;
}

type DrawnPointPayload = DesignerState["drawnPoint"];

const DRAWN_POINT_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "columnLength",
  "mirrorX",
  "mirrorY",
  "zGantryOffset",
];

const sameDrawnPoint = (
  prev: DrawnPointPayload,
  next: DrawnPointPayload,
) =>
  prev === next ||
  (!!prev && !!next &&
    prev.cx === next.cx &&
    prev.cy === next.cy &&
    prev.z === next.z &&
    prev.r === next.r &&
    prev.color === next.color &&
    prev.at_soil_level === next.at_soil_level);

export const drawnPointPropsEqual = (
  prev: DrawnPointPreviewProps,
  next: DrawnPointPreviewProps,
) =>
  prev.mode === next.mode &&
  prev.usePosition === next.usePosition &&
  prev.radiusRef === next.radiusRef &&
  prev.torusRef === next.torusRef &&
  prev.billboardRef === next.billboardRef &&
  prev.imageRef === next.imageRef &&
  prev.getZ === next.getZ &&
  sameDrawnPoint(prev.designer.drawnPoint, next.designer.drawnPoint) &&
  DRAWN_POINT_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

// eslint-disable-next-line complexity
const DrawnPointPreview = (props: DrawnPointPreviewProps) => {
  const { config } = props;
  const { drawnPoint } = props.designer;
  const drawnPointPosition =
    drawnPoint && !isUndefined(drawnPoint.cx) && !isUndefined(drawnPoint.cy)
      ? {
        x: drawnPoint.cx,
        y: drawnPoint.cy,
        z: drawnPoint.at_soil_level
          ? drawnPoint.z ?? 0
          : props.getZ?.(drawnPoint.cx, drawnPoint.cy) ?? 0,
      }
      : undefined;
  if (props.usePosition && isUndefined(drawnPointPosition)) { return <></>; }
  const Base = props.mode == Mode.createWeed ? WeedBase : PointBase;
  return <Base
    pointName={"drawn-point"}
    alpha={0.5}
    position={props.usePosition ? drawnPointPosition : undefined}
    color={drawnPoint?.color}
    config={config}
    radius={drawnPoint?.r || 0}
    radiusRef={props.radiusRef}
    torusRef={props.torusRef}
    billboardRef={props.billboardRef}
    imageRef={props.imageRef} />;
};

const MemoDrawnPointPreview =
  React.memo(DrawnPointPreview, drawnPointPropsEqual);

export const DrawnPoint = (props: DrawnPointProps) =>
  <MemoDrawnPointPreview {...props} mode={getMode()} />;

interface PointBaseProps {
  pointName: string;
  position?: Record<Xyz, number>;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onHoverObject?: ThreeDObjectHoverHandler;
  color: string | undefined;
  radius: number;
  alpha: number;
  config: Config;
  torusRef?: TorusRef;
  billboardRef?: BillboardRef;
  imageRef?: ImageRef;
  onHoverLabel?(hovered: boolean): void;
}

const PointBase = (props: PointBaseProps) => {
  const {
    pointName, position, onClick, color, alpha, config, radius, torusRef,
  } = props;
  const getWorldPosition = getWorldPositionFunc(config);
  return <Group
    name={"point-" + pointName}
    renderOrder={RenderOrder.default}
    rotation={[Math.PI / 2, 0, 0]}
    position={position
      ? getWorldPosition(position)
      : [0, 0, 0]}
    onPointerOver={() => {
      props.onHoverObject?.(true);
      props.onHoverLabel?.(true);
    }}
    onPointerOut={() => {
      props.onHoverObject?.(false);
      props.onHoverLabel?.(false);
    }}>
    <Group name={"marker"}
      onClick={onClick}>
      <Cylinder
        args={[POINT_PIN_RADIUS, 0, POINT_PIN_HEIGHT, 16, 2, true]}
        position={[0, POINT_PIN_HEIGHT / 2, 0]}>
        <MeshPhongMaterial
          color={color}
          side={DoubleSide}
          transparent={alpha < 1}
          depthWrite={alpha == 1}
          opacity={1 * alpha} />
      </Cylinder>
      <Sphere
        args={[POINT_PIN_RADIUS, 16, 16]}
        position={[0, POINT_PIN_HEIGHT, 0]}>
        <MeshPhongMaterial
          color={color}
          side={DoubleSide}
          transparent={alpha < 1}
          depthWrite={alpha == 1}
          opacity={1 * alpha} />
      </Sphere>
    </Group>
    {(radius > 0 || torusRef) &&
      <HollowCylinder
        torusRef={torusRef}
        radius={radius}
        thickness={10}
        color={color}
        alpha={0.5 * alpha} />}
  </Group>;
};

interface HollowCylinderProps {
  radius: number;
  thickness: number;
  color?: string;
  alpha: number;
  torusRef?: TorusRef;
}

const setTorusRefCurrent = (torusRef: TorusRef, node: ThreeMesh | null) => {
  (torusRef as React.MutableRefObject<ThreeMesh | null>).current = node;
};

const HollowCylinder = (
  { radius, color, alpha, torusRef }: HollowCylinderProps,
) => {
  const setTorusRef = React.useCallback((node: ThreeMesh | null) => {
    if (!torusRef) { return; }
    const maybeMesh = node as Partial<ThreeMesh> | null;
    if (!node || maybeMesh?.scale) {
      setTorusRefCurrent(torusRef, node);
    }
  }, [torusRef]);
  return torusRef
    ? <Torus
      ref={setTorusRef}
      scale={[radius, radius, POINT_CYLINDER_SCALE_FACTOR]}
      rotation={[-Math.PI / 2, 0, 0]}
      args={[
        1,
        POINT_CYLINDER_TUBE_SIZE,
        ...RADIUS_TORUS_SEGMENTS,
      ]}>
      <MeshPhongMaterial
        color={color}
        transparent={true}
        depthWrite={false}
        opacity={alpha} />
    </Torus>
    : <Torus
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[1, 1, POINT_CYLINDER_HEIGHT / 5]}
      args={[radius, 5, ...RADIUS_TORUS_SEGMENTS]}>
      <MeshPhongMaterial
        color={color}
        transparent={true}
        depthWrite={false}
        opacity={alpha} />
    </Torus>;
};
