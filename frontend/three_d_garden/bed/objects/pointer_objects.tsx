import React from "react";
import { Group, MeshPhongMaterial } from "../../components";
import { Billboard, Line, Image, Sphere } from "@react-three/drei";
import { findCrop, findIcon } from "../../../crops/find";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode, round, xyDistance } from "../../../farm_designer/map/util";
import { isMobile } from "../../../screen_size";
import { HOVER_OBJECT_MODES, DRAW_POINT_MODES, RenderOrder } from "../../constants";
import {
  DrawnPoint,
  outOfBoundsShaderModification,
  POINT_CYLINDER_SCALE_FACTOR,
  WEED_IMG_SIZE_FRACTION,
} from "../../garden";
import {
  zero as zeroFunc,
  extents as extentsFunc,
  zZero,
  getGardenPositionFunc,
  get3DPositionFunc,
} from "../../helpers";
import { Config } from "../../config";
import { SpecialStatus, TaggedGenericPointer } from "farmbot";
import { AddPlantProps } from "../bed";
import { DEFAULT_PLANT_RADIUS } from "../../../farm_designer/plant";
import { isUndefined, round as mathRound } from "lodash";
import {
  Mesh as MeshType,
  Group as GroupType,
  Color,
  Vector3,
  WebGLProgramParametersWithUniforms,
} from "three";
import { Path } from "../../../internal_urls";
import { ThreeEvent } from "@react-three/fiber";
import { dropPlant } from "../../../farm_designer/map/layers/plants/plant_actions";
import { createPoint } from "../../../points/create_points";
import { Actions } from "../../../constants";
import { NavigateFunction, useLocation } from "react-router";
import { DrawnPointPayl } from "../../../farm_designer/interfaces";
import { Line2 } from "three/examples/jsm/lines/Line2";

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
  const location = useLocation();
  const {
    config, mapPoints, addPlantProps,
    pointerPlantRef, radiusRef, torusRef, billboardRef, imageRef,
    xCrosshairRef, yCrosshairRef,
  } = props;
  const zero = React.useMemo(() => zeroFunc(config), [config]);
  const extents = React.useMemo(() => extentsFunc(config), [config]);
  const iconSize = React.useMemo(
    () => (addPlantProps.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2,
    [addPlantProps.designer.cropRadius],
  );

  const { drawnPoint } = addPlantProps.designer;
  const settingRadius = React.useMemo(
    () => !(isUndefined(drawnPoint?.cx) || isUndefined(drawnPoint.cy)),
    [drawnPoint?.cx, drawnPoint?.cy],
  );
  const gridPreview = React.useMemo(() => mapPoints.some(p =>
    p.specialStatus == SpecialStatus.DIRTY && p.body.meta.gridId,
  ), [mapPoints]);
  const boundsCenter = React.useMemo(() => new Vector3(
    0,
    0,
    -10000 + config.columnLength + 40 - config.zGantryOffset,
  ), [
    config.columnLength,
    config.zGantryOffset,
  ]);
  const halfSize = React.useMemo(() => new Vector3(
    config.bedLengthOuter / 2 - 300,
    config.bedWidthOuter / 2 - config.bedWallThickness,
    10000,
  ), [
    config.bedLengthOuter,
    config.bedWidthOuter,
    config.bedWallThickness,
  ]);
  const xCrosshairPoints = React.useMemo<[number, number, number][]>(
    () => ([
      [zero.x, 0, 0],
      [extents.x, 0, 0],
    ]), [extents.x, zero.x]);
  const yCrosshairPoints = React.useMemo<[number, number, number][]>(
    () => ([
      [0, zero.y, 0],
      [0, extents.y, 0],
    ]), [extents.y, zero.y]);
  const insideColor = React.useMemo(() => new Color("white"), []);
  const outsideColor = React.useMemo(() => new Color("red"), []);
  const mode = React.useMemo(() => getMode(), [
    location.hash,
    location.pathname,
    location.search,
  ]);
  const hoverMode = HOVER_OBJECT_MODES.includes(mode);
  const isClickToAdd = mode == Mode.clickToAdd;
  const drawPointMode = DRAW_POINT_MODES.includes(mode);
  const slug = Path.getCropSlug();
  const iconUrl = React.useMemo(() => findIcon(slug), [slug]);
  const cropSpread = React.useMemo(() => findCrop(slug).spread, [slug]);
  const onBeforeCompile = React.useCallback(
    (shader: WebGLProgramParametersWithUniforms) => {
      shader.uniforms.uBoundsCenter = { value: boundsCenter };
      shader.uniforms.uHalfSize = { value: halfSize };
      shader.uniforms.uInside = { value: insideColor };
      shader.uniforms.uOutside = { value: outsideColor };
      outOfBoundsShaderModification(shader);
    }, [boundsCenter, halfSize, insideColor, outsideColor]);
  return hoverMode &&
    !isMobile() &&
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
            points={xCrosshairPoints} />
          <Line
            ref={yCrosshairRef}
            name={"y-crosshair"}
            color={"white"}
            transparent={true}
            opacity={0.9}
            lineWidth={2}
            points={yCrosshairPoints} />
        </Group>}
      <Group ref={pointerPlantRef} position={[0, 0, 0]}>
        <Group position={[0, 0, 0]}>
          {drawPointMode &&
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
          {isClickToAdd &&
            <Group>
              <Billboard follow={true} position={[0, 0, iconSize / 2]}>
                <Image
                  name={"pointerPlant"}
                  url={iconUrl}
                  scale={iconSize}
                  transparent={true}
                  renderOrder={RenderOrder.pointerPlant} />
              </Billboard>
              <Sphere args={[cropSpread / 2 * 10, 32, 32]}>
                <MeshPhongMaterial
                  color={"white"}
                  transparent={true}
                  opacity={0.4}
                  onBeforeCompile={onBeforeCompile}
                  depthWrite={false} />
              </Sphere>
            </Group>}
        </Group>
      </Group>
    </Group>;
};

export interface SoilClickProps {
  config: Config;
  addPlantProps: AddPlantProps;
  pointerPlantRef: PointerPlantRef;
  navigate: NavigateFunction;
  getZ(x: number, y: number): number;
}

export const soilClick = (props: SoilClickProps) => {
  const { config, navigate, addPlantProps, pointerPlantRef } = props;
  const getGardenPosition = getGardenPositionFunc(config);
  return (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (addPlantProps) {
      const mode = getMode();
      if (mode == Mode.clickToAdd) {
        dropPlant({
          gardenCoords: getGardenPosition(e.point),
          gridSize: addPlantProps.gridSize,
          dispatch: addPlantProps.dispatch,
          getConfigValue: addPlantProps.getConfigValue,
          curves: addPlantProps.curves,
          designer: addPlantProps.designer,
        });
      }
      if (DRAW_POINT_MODES.includes(mode)) {
        pointerPlantRef.current?.position.set(0, 0, 0);
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
};

export interface SoilPointerMoveProps extends AllRefs {
  config: Config;
  addPlantProps: AddPlantProps;
  getZ(x: number, y: number): number;
  activePositionRef: ActivePositionRef;
  invalidate?: () => void;
}

export const soilPointerMove = (props: SoilPointerMoveProps) => {
  const {
    config, addPlantProps,
    pointerPlantRef,
    radiusRef, torusRef, billboardRef, imageRef,
    xCrosshairRef, yCrosshairRef, activePositionRef, invalidate,
  } = props;
  const getGardenPosition = getGardenPositionFunc(config);
  const get3DPosition = get3DPositionFunc(config);
  const zZeroPosition = zZero(config);
  return (e: ThreeEvent<MouseEvent>) => {
    const mode = getMode();
    if (addPlantProps
      && HOVER_OBJECT_MODES.includes(mode)
      && !isMobile()
      && pointerPlantRef.current) {
      const gardenPosition = getGardenPosition(e.point);
      const { x, y } = get3DPosition(gardenPosition);
      const z = zZeroPosition + props.getZ(gardenPosition.x, gardenPosition.y);
      xCrosshairRef.current?.position.set(0, y, z);
      yCrosshairRef.current?.position.set(x, 0, z);
      activePositionRef.current = { x, y };
      invalidate?.();
      if (mode == Mode.clickToAdd) {
        pointerPlantRef.current.position.set(x, y, z);
      }
      if (DRAW_POINT_MODES.includes(mode)) {
        const { drawnPoint } = addPlantProps.designer;
        if (isUndefined(drawnPoint)) { return; }
        if (isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy)) {
          pointerPlantRef.current.position.set(x, y, z);
        } else {
          if (drawnPoint.r > 0) { return; }
          const radius = round(xyDistance(
            { x: drawnPoint.cx, y: drawnPoint.cy },
            getGardenPosition(e.point)));
          radiusRef.current?.scale.set(radius, radius, radius);
          torusRef.current?.scale.set(radius, radius, POINT_CYLINDER_SCALE_FACTOR);
          const imgSize = mathRound(radius * WEED_IMG_SIZE_FRACTION);
          billboardRef.current?.position.set(0, 0, imgSize / 2);
          imageRef.current?.scale.set(imgSize, imgSize, imgSize);
        }
      }
    }
  };
};
