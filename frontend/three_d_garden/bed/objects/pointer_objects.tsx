import React from "react";
import {
  Group, MeshPhongMaterial, Mesh, PlaneGeometry, MeshBasicMaterial,
} from "../../components";
import { Billboard, Line, Sphere, useTexture } from "@react-three/drei";
import {
  DEFAULT_PLANT_RADIUS, findCropIcon, findCropMetadata,
} from "../../../crops/metadata";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode, round, xyDistance } from "../../../farm_designer/map/util";
import { isMobile } from "../../../screen_size";
import { HOVER_OBJECT_MODES, DRAW_POINT_MODES, RenderOrder } from "../../constants";
import {
  DrawnPoint,
  getBoundsCenter,
  getHalfSize,
  outOfBoundsShaderModification,
  POINT_CYLINDER_SCALE_FACTOR,
  WEED_IMG_SIZE_FRACTION,
} from "../../garden";
import {
  zero as zeroFunc,
  extents as extentsFunc,
  getGardenPositionFunc,
  get3DPositionFunc,
  getWorldPositionFunc,
} from "../../helpers";
import { Config } from "../../config";
import { SpecialStatus, TaggedGenericPointer } from "farmbot";
import { AddPlantProps } from "../bed";
import { isUndefined, round as mathRound } from "lodash";
import { Mesh as MeshType, Group as GroupType, Color } from "three";
import { Path } from "../../../internal_urls";
import { ThreeEvent } from "@react-three/fiber";
import { dropPlant3D } from "../../plant_actions";
import { createPoint } from "../../../points/create_point_action";
import { Actions } from "../../../constants";
import { NavigateFunction } from "react-router";
import { DrawnPointPayl } from "../../../farm_designer/interfaces";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import {
  getPlantIconTexture,
  getPlantIconTextureUrl,
} from "../../garden/plant_icon_atlas";
import { clickWasDragged } from "../../click_event";

export type PointerPlantRef = React.RefObject<GroupType | null>;
export type RadiusRef = React.RefObject<MeshType | null>;
export type TorusRef = React.RefObject<MeshType | null>;
export type BillboardRef = React.RefObject<GroupType | null>;
export type ImageRef = React.RefObject<MeshType | null>;
export type XCrosshairRef = React.RefObject<Line2 | null>;
export type YCrosshairRef = React.RefObject<Line2 | null>;
export type ActivePositionRef = React.RefObject<{ x: number, y: number } | null>;

interface AllRefs {
  pointerPlantRef: PointerPlantRef;
  radiusRef: RadiusRef;
  torusRef: TorusRef;
  billboardRef: BillboardRef;
  imageRef: ImageRef;
  xCrosshairRef: XCrosshairRef;
  yCrosshairRef: YCrosshairRef;
}

export interface PointerObjectsProps extends AllRefs {
  config: Config;
  mapPoints: TaggedGenericPointer[];
  addPlantProps: AddPlantProps;
  activePositionRef: ActivePositionRef;
}

export const PointerObjects = (props: PointerObjectsProps) => {
  const mode = getMode();
  if (!HOVER_OBJECT_MODES.includes(mode) || isMobile()) { return <></>; }
  return <ActivePointerObjects
    {...props}
    mode={mode}
    cropSlug={Path.getCropSlug()} />;
};

interface ActivePointerObjectsProps extends PointerObjectsProps {
  mode: Mode;
  cropSlug: string;
}

const PREVIEW_CONFIG_KEYS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWallThickness",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeX",
  "botSizeY",
  "botSizeZ",
  "columnLength",
  "mirrorX",
  "mirrorY",
  "zGantryOffset",
];

export const hasDirtyGridPreview = (mapPoints: TaggedGenericPointer[]) =>
  mapPoints.some(p =>
    p.specialStatus == SpecialStatus.DIRTY && p.body.meta.gridId);

const samePreviewConfig = (prev: Config, next: Config) =>
  PREVIEW_CONFIG_KEYS.every(key => prev[key] === next[key]);

const sameDrawnPoint = (
  prev: AddPlantProps["designer"]["drawnPoint"],
  next: AddPlantProps["designer"]["drawnPoint"],
) =>
  prev === next ||
  !!prev && !!next &&
  prev.cx === next.cx &&
  prev.cy === next.cy &&
  prev.z === next.z &&
  prev.r === next.r &&
  prev.color === next.color;

const samePreviewRefs = (
  prev: ActivePointerObjectsProps,
  next: ActivePointerObjectsProps,
) =>
  prev.pointerPlantRef === next.pointerPlantRef &&
  prev.radiusRef === next.radiusRef &&
  prev.torusRef === next.torusRef &&
  prev.billboardRef === next.billboardRef &&
  prev.imageRef === next.imageRef &&
  prev.xCrosshairRef === next.xCrosshairRef &&
  prev.yCrosshairRef === next.yCrosshairRef &&
  prev.activePositionRef === next.activePositionRef;

const samePreviewDesigner = (
  prev: AddPlantProps["designer"],
  next: AddPlantProps["designer"],
) =>
  prev.cropRadius == next.cropRadius &&
  sameDrawnPoint(prev.drawnPoint, next.drawnPoint);

const sameGridPreviewState = (
  prev: TaggedGenericPointer[],
  next: TaggedGenericPointer[],
) =>
  prev === next || hasDirtyGridPreview(prev) == hasDirtyGridPreview(next);

export const activePointerObjectsPropsEqual = (
  prev: ActivePointerObjectsProps,
  next: ActivePointerObjectsProps,
) =>
  prev.mode === next.mode &&
  prev.cropSlug === next.cropSlug &&
  samePreviewRefs(prev, next) &&
  samePreviewConfig(prev.config, next.config) &&
  samePreviewDesigner(
    prev.addPlantProps.designer,
    next.addPlantProps.designer) &&
  sameGridPreviewState(prev.mapPoints, next.mapPoints);

const ActivePointerObjects = React.memo((props: ActivePointerObjectsProps) => {
  const {
    config, mapPoints, addPlantProps,
    pointerPlantRef, radiusRef, torusRef, billboardRef, imageRef,
    xCrosshairRef, yCrosshairRef,
    mode, cropSlug,
  } = props;
  const zero = zeroFunc(config);
  const extents = extentsFunc(config);
  const iconSize = (addPlantProps.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2;
  const icon = findCropIcon(cropSlug);
  const baseTexture = useTexture(getPlantIconTextureUrl(icon));
  const plantIconTexture = React.useMemo(
    () => getPlantIconTexture(baseTexture, icon),
    [baseTexture, icon]);

  const { drawnPoint } = addPlantProps.designer;
  const settingRadius =
    !(isUndefined(drawnPoint?.cx) || isUndefined(drawnPoint.cy));
  const gridPreview = hasDirtyGridPreview(mapPoints);
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const boundsCenter = React.useMemo(getBoundsCenter(config), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  const halfSize = React.useMemo(getHalfSize(config), []);
  return (
    <Group name={"hover-elements"}>
      {!settingRadius &&
        !gridPreview &&
        <Group name={"helpers"}>
          <Line
            ref={xCrosshairRef}
            name={"x-crosshair"}
            color={"white"}
            transparent={true}
            opacity={0.9}
            lineWidth={2}
            points={[
              [zero.x, 0, 0],
              [extents.x, 0, 0],
            ]} />
          <Line
            ref={yCrosshairRef}
            name={"y-crosshair"}
            color={"white"}
            transparent={true}
            opacity={0.9}
            lineWidth={2}
            points={[
              [0, zero.y, 0],
              [0, extents.y, 0],
            ]} />
        </Group>}
      <Group ref={pointerPlantRef} position={[0, 0, 0]}>
        <Group position={[0, 0, 0]}>
          {DRAW_POINT_MODES.includes(mode) &&
            !gridPreview &&
            drawnPoint &&
            <DrawnPoint
              radiusRef={radiusRef}
              torusRef={torusRef}
              billboardRef={billboardRef}
              imageRef={imageRef}
              config={config}
              designer={addPlantProps.designer}
              usePosition={settingRadius} />}
          {mode == Mode.clickToAdd &&
            <Group>
              <Billboard follow={true} position={[0, 0, iconSize / 2]}>
                <Mesh
                  name={"pointerPlant"}
                  renderOrder={RenderOrder.pointerPlant}>
                  <PlaneGeometry args={[iconSize, iconSize]} />
                  <MeshBasicMaterial
                    map={plantIconTexture}
                    alphaTest={0.1}
                    transparent={true} />
                </Mesh>
              </Billboard>
              <Sphere args={[findCropMetadata(cropSlug).spread / 2 * 10, 32, 32]}>
                <MeshPhongMaterial
                  color={"white"}
                  transparent={true}
                  opacity={0.4}
                  onBeforeCompile={(shader) => {
                    shader.uniforms.uBoundsCenter = { value: boundsCenter };
                    shader.uniforms.uHalfSize = { value: halfSize };
                    shader.uniforms.uInside = { value: new Color("white") };
                    shader.uniforms.uOutside = { value: new Color("red") };
                    shader.uniforms.uMirrorX = { value: config.mirrorX ? -1 : 1 };
                    shader.uniforms.uMirrorY = { value: config.mirrorY ? -1 : 1 };
                    outOfBoundsShaderModification(shader);
                  }}
                  depthWrite={false} />
              </Sphere>
            </Group>}
        </Group>
      </Group>
    </Group>
  );
}, activePointerObjectsPropsEqual);

export interface SoilClickProps {
  config: Config;
  addPlantProps: AddPlantProps;
  pointerPlantRef: PointerPlantRef;
  navigate: NavigateFunction;
  getZ(x: number, y: number): number;
}

export const soilClick = (props: SoilClickProps) =>
  (e: ThreeEvent<MouseEvent>) => {
    const { config, navigate, addPlantProps, pointerPlantRef } = props;
    const getGardenPosition = getGardenPositionFunc(config);
    e.stopPropagation();
    if (clickWasDragged(e)) { return; }
    if (addPlantProps) {
      if (getMode() == Mode.clickToAdd) {
        dropPlant3D({
          gardenCoords: getGardenPosition(e.point),
          gridSize: addPlantProps.gridSize,
          dispatch: addPlantProps.dispatch,
          getConfigValue: addPlantProps.getConfigValue,
          designer: addPlantProps.designer,
        });
      }
      if (DRAW_POINT_MODES.includes(getMode())) {
        pointerPlantRef.current?.position?.set(0, 0, 0);
        const cursor = getGardenPosition(e.point);
        const { drawnPoint } = addPlantProps.designer;
        if (isUndefined(drawnPoint)) { return; }
        const payload: DrawnPointPayl =
          (isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy))
            ? {
              ...drawnPoint,
              cx: cursor.x,
              cy: cursor.y,
              z: mathRound(props.getZ(cursor.x, cursor.y), 1),
            }
            : {
              ...drawnPoint,
              cx: drawnPoint.cx,
              cy: drawnPoint.cy,
              r: round(xyDistance(
                { x: drawnPoint.cx, y: drawnPoint.cy },
                cursor)),
            };
        addPlantProps.dispatch({
          type: Actions.SET_DRAWN_POINT_DATA,
          payload,
        });
        if (payload.r) {
          createPoint({
            dispatch: addPlantProps.dispatch,
            drawnPoint: payload,
            navigate: navigate,
          });
        }
      }
    }
  };

export interface SoilPointerMoveProps extends AllRefs {
  config: Config;
  addPlantProps: AddPlantProps;
  getZ(x: number, y: number): number;
  activePositionRef: ActivePositionRef;
}

// eslint-disable-next-line complexity
export const soilPointerMove = (props: SoilPointerMoveProps) =>
  (() => {
    const {
      config, addPlantProps,
      pointerPlantRef,
      radiusRef, torusRef, billboardRef, imageRef,
      xCrosshairRef, yCrosshairRef, activePositionRef,
    } = props;
    const getGardenPosition = getGardenPositionFunc(config);
    const get3DPosition = get3DPositionFunc(config);
    const getWorldPosition = getWorldPositionFunc(config);
    let frame = 0;
    let pendingGardenPosition: ReturnType<typeof getGardenPosition> | undefined;
    let lastRenderedPosition: { x: number, y: number } | undefined;

    // eslint-disable-next-line complexity
    const updatePointer = () => {
      frame = 0;
      const gardenPosition = pendingGardenPosition;
      pendingGardenPosition = undefined;
      if (!gardenPosition
        || !addPlantProps
        || !HOVER_OBJECT_MODES.includes(getMode())
        || isMobile()
        || !pointerPlantRef.current) { return; }
      const { x, y } = get3DPosition(gardenPosition);
      if (lastRenderedPosition?.x === x && lastRenderedPosition.y === y) {
        return;
      }
      const [, , z] = getWorldPosition({
        ...gardenPosition,
        z: props.getZ(gardenPosition.x, gardenPosition.y),
      });
      xCrosshairRef.current?.position.set(0, y, z);
      yCrosshairRef.current?.position.set(x, 0, z);
      activePositionRef.current = { x, y };
      lastRenderedPosition = { x, y };
      if (getMode() == Mode.clickToAdd) {
        pointerPlantRef.current.position?.set(x, y, z);
      }
      if (DRAW_POINT_MODES.includes(getMode())) {
        const { drawnPoint } = addPlantProps.designer;
        if (isUndefined(drawnPoint)) { return; }
        if (isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy)) {
          pointerPlantRef.current.position?.set(x, y, z);
        } else {
          if (drawnPoint.r > 0) { return; }
          const radius = round(xyDistance(
            { x: drawnPoint.cx, y: drawnPoint.cy },
            gardenPosition));
          radiusRef.current?.scale.set(radius, radius, radius);
          torusRef.current?.scale.set(
            radius, radius, POINT_CYLINDER_SCALE_FACTOR);
          const imgSize = mathRound(radius * WEED_IMG_SIZE_FRACTION);
          billboardRef.current?.position.set(0, 0, imgSize / 2);
          imageRef.current?.scale.set(imgSize, imgSize, imgSize);
        }
      }
    };

    // eslint-disable-next-line complexity
    return (e: ThreeEvent<MouseEvent>) => {
      pendingGardenPosition = getGardenPosition(e.point);
      if (!frame) {
        frame = requestAnimationFrame(updatePointer);
      }
    };
  })();
