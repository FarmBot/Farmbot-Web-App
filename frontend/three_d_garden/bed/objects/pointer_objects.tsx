import React from "react";
import { Group } from "../../components";
import { Billboard, Line, Image } from "@react-three/drei";
import { findIcon } from "../../../crops/find";
import { AxisNumberProperty, Mode } from "../../../farm_designer/map/interfaces";
import { getMode, round, xyDistance } from "../../../farm_designer/map/util";
import { isMobile } from "../../../screen_size";
import { HOVER_OBJECT_MODES, DRAW_POINT_MODES } from "../../constants";
import { DrawnPoint } from "../../garden";
import {
  zero as zeroFunc, extents as extentsFunc, threeSpace,
} from "../../helpers";
import { Config } from "../../config";
import { SpecialStatus, TaggedGenericPointer } from "farmbot";
import { AddPlantProps } from "../bed";
import { DEFAULT_PLANT_RADIUS } from "../../../farm_designer/plant";
import { isUndefined } from "lodash";
import { Mesh as MeshType, Group as GroupType } from "three";
import { Path } from "../../../internal_urls";
import { ThreeEvent } from "@react-three/fiber";
import { dropPlant } from "../../../farm_designer/map/layers/plants/plant_actions";
import { createPoint } from "../../../points/create_points";
import { Actions } from "../../../constants";
import { NavigateFunction } from "react-router";
import { DrawnPointPayl } from "../../../farm_designer/interfaces";
import { Line2 } from "three/examples/jsm/lines/Line2";

type XY = AxisNumberProperty;

const getGardenPositionFunc = (config: Config) =>
  (threeDPosition: XY): XY => {
    const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = config;
    return {
      x: round(threeSpace(threeDPosition.x, -bedLengthOuter) - bedXOffset),
      y: round(threeSpace(threeDPosition.y, -bedWidthOuter) - bedYOffset),
    };
  };

const get3DPositionFunc = (config: Config) =>
  (gardenPosition: XY): XY => {
    const { bedLengthOuter, bedWidthOuter, bedXOffset, bedYOffset } = config;
    return {
      x: threeSpace(gardenPosition.x + bedXOffset, bedLengthOuter),
      y: threeSpace(gardenPosition.y + bedYOffset, bedWidthOuter),
    };
  };

export interface PointerObjectsProps {
  config: Config;
  mapPoints: TaggedGenericPointer[];
  addPlantProps: AddPlantProps;
  pointerPlantRef: React.RefObject<GroupType | null>;
  radiusRef: React.RefObject<GroupType | null>;
  billboardRef: React.RefObject<GroupType | null>;
  imageRef: React.RefObject<MeshType | null>;
  xCrosshairRef: React.RefObject<Line2 | null>;
  yCrosshairRef: React.RefObject<Line2 | null>;
}

export const PointerObjects = (props: PointerObjectsProps) => {
  const {
    config, mapPoints, addPlantProps,
    pointerPlantRef, radiusRef, billboardRef, imageRef,
    xCrosshairRef, yCrosshairRef,
  } = props;
  const zero = zeroFunc(config);
  const extents = extentsFunc(config);
  const iconSize = (addPlantProps.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2;

  const { drawnPoint } = addPlantProps.designer;
  const settingRadius =
    !(isUndefined(drawnPoint?.cx) || isUndefined(drawnPoint.cy));
  const soilZ = zero.z - config.soilHeight;
  const crosshairZ = soilZ + 5;
  const gridPreview = mapPoints
    .filter(p => p.specialStatus == SpecialStatus.DIRTY && p.body.meta.gridId)
    .length > 0;

  return HOVER_OBJECT_MODES.includes(getMode()) &&
    !isMobile() &&
    <Group name={"hover-elements"}>
      {!settingRadius &&
        !gridPreview &&
        <Group name={"helpers"}>
          <Line
            ref={xCrosshairRef}
            name={"x-crosshair"}
            color={"gray"}
            lineWidth={2}
            points={[
              [zero.x, 0, crosshairZ],
              [extents.x, 0, crosshairZ],
            ]} />
          <Line
            ref={yCrosshairRef}
            name={"y-crosshair"}
            color={"gray"}
            lineWidth={2}
            points={[
              [0, zero.y, crosshairZ],
              [0, extents.y, crosshairZ],
            ]} />
        </Group>}
      <Group ref={pointerPlantRef} position={[0, 0, 0]}>
        <Group position={[0, 0, settingRadius ? 0 : soilZ]}>
          {DRAW_POINT_MODES.includes(getMode()) &&
            !gridPreview &&
            drawnPoint &&
            <DrawnPoint
              radiusRef={radiusRef}
              billboardRef={billboardRef}
              imageRef={imageRef}
              config={config}
              designer={addPlantProps.designer}
              usePosition={settingRadius} />}
          {getMode() == Mode.clickToAdd &&
            <Billboard follow={true} position={[0, 0, iconSize / 2]}>
              <Image
                name={"pointerPlant"}
                url={findIcon(Path.getCropSlug())}
                scale={iconSize}
                transparent={true}
                renderOrder={1} />
            </Billboard>}
        </Group>
      </Group>
    </Group>;
};

export interface SoilClickProps {
  config: Config;
  addPlantProps: AddPlantProps;
  pointerPlantRef: React.RefObject<GroupType | null>;
  navigate: NavigateFunction;
}

export const soilClick = (props: SoilClickProps) =>
  (e: ThreeEvent<MouseEvent>) => {
    const { config, navigate, addPlantProps, pointerPlantRef } = props;
    const getGardenPosition = getGardenPositionFunc(config);
    e.stopPropagation();
    if (addPlantProps) {
      if (getMode() == Mode.clickToAdd) {
        dropPlant({
          gardenCoords: getGardenPosition(e.point),
          gridSize: addPlantProps.gridSize,
          dispatch: addPlantProps.dispatch,
          getConfigValue: addPlantProps.getConfigValue,
          plants: addPlantProps.plants,
          curves: addPlantProps.curves,
          designer: addPlantProps.designer,
        });
      }
      if (DRAW_POINT_MODES.includes(getMode())) {
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
              z: -config.soilHeight,
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

export interface SoilPointerMoveProps {
  config: Config;
  addPlantProps: AddPlantProps;
  pointerPlantRef: React.RefObject<GroupType | null>;
  radiusRef: React.RefObject<GroupType | null>;
  billboardRef: React.RefObject<GroupType | null>;
  imageRef: React.RefObject<MeshType | null>;
  xCrosshairRef: React.RefObject<Line2 | null>;
  yCrosshairRef: React.RefObject<Line2 | null>;
}

export const soilPointerMove = (props: SoilPointerMoveProps) =>
  (e: ThreeEvent<MouseEvent>) => {
    const {
      config, addPlantProps,
      pointerPlantRef,
      radiusRef, billboardRef, imageRef,
      xCrosshairRef, yCrosshairRef,
    } = props;
    const getGardenPosition = getGardenPositionFunc(config);
    const get3DPosition = get3DPositionFunc(config);
    if (addPlantProps
      && HOVER_OBJECT_MODES.includes(getMode())
      && !isMobile()
      && pointerPlantRef.current) {
      const position = get3DPosition(getGardenPosition(e.point));
      xCrosshairRef.current?.position.set(0, position.y, 0);
      yCrosshairRef.current?.position.set(position.x, 0, 0);
      if (getMode() == Mode.clickToAdd) {
        pointerPlantRef.current.position.set(position.x, position.y, 0);
      }
      if (DRAW_POINT_MODES.includes(getMode())) {
        const { drawnPoint } = addPlantProps.designer;
        if (isUndefined(drawnPoint)) { return; }
        if (isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy)) {
          pointerPlantRef.current.position.set(position.x, position.y, 0);
        } else {
          if (drawnPoint.r > 0) { return; }
          const radius = round(xyDistance(
            { x: drawnPoint.cx, y: drawnPoint.cy },
            getGardenPosition(e.point)));
          radiusRef.current?.scale.set(
            radius,
            getMode() == Mode.createPoint ? 1 : radius,
            radius);
          billboardRef.current?.position.set(0, 0, radius / 2);
          imageRef.current?.scale.set(radius, radius, radius);
        }
      }
    }
  };
