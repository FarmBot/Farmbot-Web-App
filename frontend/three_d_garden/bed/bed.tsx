import React from "react";
import {
  Billboard, Box, Detailed, Extrude, useTexture, Image,
  Cylinder,
  Sphere,
} from "@react-three/drei";
import {
  DoubleSide, Path as LinePath, Shape, RepeatWrapping, Group as GroupType,
  Mesh,
} from "three";
import { isUndefined, range } from "lodash";
import { threeSpace, zZero, getColorFromBrightness } from "../helpers";
import { Config, detailLevels } from "../config";
import { ASSETS, DRAW_POINT_MODES, HOVER_OBJECT_MODES } from "../constants";
import { DistanceIndicator } from "../elements";
import { FarmbotAxes, Caster, UtilitiesPost, Packaging } from "./objects";
import { Group, MeshPhongMaterial } from "../components";
import { getMode, round, xyDistance } from "../../farm_designer/map/util";
import {
  AxisNumberProperty, Mode, TaggedPlant,
} from "../../farm_designer/map/interfaces";
import { dropPlant } from "../../farm_designer/map/layers/plants/plant_actions";
import { TaggedCurve } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { DesignerState, DrawnPointPayl } from "../../farm_designer/interfaces";
import { isMobile } from "../../screen_size";
import { ThreeEvent } from "@react-three/fiber";
import { Path } from "../../internal_urls";
import { findIcon } from "../../crops/find";
import { DEFAULT_PLANT_RADIUS } from "../../farm_designer/plant";
import { DrawnPoint } from "../garden";
import { Actions } from "../../constants";
import { createPoint } from "../../points/create_points";
import { useNavigate } from "react-router";

const soil = (
  Type: typeof LinePath | typeof Shape,
  botSize: Record<"x" | "y" | "z" | "thickness", number>,
): LinePath | Shape => {
  const { x, y, thickness } = botSize;

  const hole = new Type();
  hole.moveTo(thickness, thickness);
  hole.lineTo(thickness, y - thickness);
  hole.lineTo(x - thickness, y - thickness);
  hole.lineTo(x - thickness, thickness);
  hole.lineTo(thickness, thickness);
  return hole;
};

const bedStructure2D = (
  botSize: Record<"x" | "y" | "z" | "thickness", number>,
) => {
  const { x, y } = botSize;
  const shape = new Shape();

  // outer edge
  shape.moveTo(0, 0);
  shape.lineTo(0, y);
  shape.lineTo(x, y);
  shape.lineTo(x, 0);
  shape.lineTo(0, 0);

  // inner edge
  shape.holes.push(soil(LinePath, botSize));

  return shape;
};

export interface AddPlantProps {
  gridSize: AxisNumberProperty;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  plants: TaggedPlant[];
  curves: TaggedCurve[];
  designer: DesignerState;
}

export interface BedProps {
  config: Config;
  activeFocus: string;
  addPlantProps?: AddPlantProps;
}

export const Bed = (props: BedProps) => {
  const {
    bedWidthOuter, bedLengthOuter, botSizeZ, bedHeight,
    bedXOffset, bedYOffset, bedZOffset,
    legSize, legsFlush, extraLegsX, extraLegsY, bedBrightness, soilBrightness,
    soilHeight, ccSupportSize, axes, xyDimensions,
  } = props.config;
  const thickness = props.config.bedWallThickness;
  const botSize = { x: bedLengthOuter, y: bedWidthOuter, z: botSizeZ, thickness };
  const bedStartZ = bedHeight;
  const bedColor = getColorFromBrightness(bedBrightness);
  const soilColor = getColorFromBrightness(soilBrightness);
  const groundZ = -bedHeight - bedZOffset;
  const legXPositions = [
    0 + legSize / 2 + thickness,
    ...(extraLegsX
      ? range(0, bedLengthOuter, bedLengthOuter / (extraLegsX + 1)).slice(1)
      : []),
    bedLengthOuter - legSize / 2 - thickness,
  ];
  const legYPositions = (index: number) =>
    [
      0 + legSize / 2 + thickness,
      ...(extraLegsY && (index == 0 || index == (legXPositions.length - 1))
        ? range(0, bedWidthOuter, bedWidthOuter / (extraLegsY + 1)).slice(1)
        : []),
      bedWidthOuter - legSize / 2 - thickness,
    ];
  const casterHeight = legSize * 1.375;

  const bedWoodTexture = useTexture(ASSETS.textures.wood + "?=bedWood");
  bedWoodTexture.wrapS = RepeatWrapping;
  bedWoodTexture.wrapT = RepeatWrapping;
  bedWoodTexture.repeat.set(0.0003, 0.003);
  const legWoodTexture = useTexture(ASSETS.textures.wood + "?=legWood");
  legWoodTexture.wrapS = RepeatWrapping;
  legWoodTexture.wrapT = RepeatWrapping;
  legWoodTexture.repeat.set(0.02, 0.05);
  const soilTexture = useTexture(ASSETS.textures.soil + "?=soil");
  soilTexture.wrapS = RepeatWrapping;
  soilTexture.wrapT = RepeatWrapping;
  soilTexture.repeat.set(0.00034, 0.00068);

  const Bed = ({ children }: { children: React.ReactElement }) =>
    <Extrude name={"bed"}
      castShadow={true}
      receiveShadow={true}
      args={[
        bedStructure2D(botSize),
        { steps: 1, depth: bedHeight, bevelEnabled: false },
      ]}
      position={[
        threeSpace(0, bedLengthOuter),
        threeSpace(0, bedWidthOuter),
        -bedStartZ,
      ]}>
      {children}
    </Extrude>;

  // eslint-disable-next-line no-null/no-null
  const pointerPlantRef = React.useRef<GroupType>(null);

  // eslint-disable-next-line no-null/no-null
  const radiusRef = React.useRef<Mesh>(null);

  type XY = AxisNumberProperty;

  const getGardenPosition = (threeDPosition: XY): XY => ({
    x: round(threeSpace(threeDPosition.x, -bedLengthOuter) - bedXOffset),
    y: round(threeSpace(threeDPosition.y, -bedWidthOuter) - bedYOffset),
  });

  const get3DPosition = (gardenPosition: XY): XY => ({
    x: threeSpace(gardenPosition.x + bedXOffset, bedLengthOuter),
    y: threeSpace(gardenPosition.y + bedYOffset, bedWidthOuter),
  });

  const iconSize =
    (props.addPlantProps?.designer.cropRadius || DEFAULT_PLANT_RADIUS) * 2;

  interface SoilProps {
    children: React.ReactElement;
    addPlantProps?: AddPlantProps;
  }

  const navigate = useNavigate();

  const Soil = ({ children, addPlantProps }: SoilProps) => {
    const soilDepth = bedHeight + zZero(props.config) - soilHeight;
    return <Extrude name={"soil"}
      onClick={(e: ThreeEvent<MouseEvent>) => {
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
            const cursor = getGardenPosition(e.point);
            const { drawnPoint } = addPlantProps.designer;
            if (isUndefined(drawnPoint)) { return; }
            const payload: DrawnPointPayl =
              (isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy))
                ? {
                  ...drawnPoint,
                  cx: cursor.x,
                  cy: cursor.y,
                  z: -props.config.soilHeight,
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
      }}
      onPointerMove={(e: ThreeEvent<MouseEvent>) => {
        if (addPlantProps
          && HOVER_OBJECT_MODES.includes(getMode())
          && !isMobile()
          && pointerPlantRef.current) {
          const position = get3DPosition(getGardenPosition(e.point));
          if (getMode() == Mode.clickToAdd) {
            pointerPlantRef.current.position.set(position.x, position.y, 0);
          }
          if (DRAW_POINT_MODES.includes(getMode())) {
            const { drawnPoint } = addPlantProps.designer;
            if (isUndefined(drawnPoint)) { return; }
            if (isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy)) {
              pointerPlantRef.current.position.set(position.x, position.y, 0);
            } else {
              const radius = round(xyDistance(
                { x: drawnPoint.cx, y: drawnPoint.cy },
                getGardenPosition(e.point)));
              radiusRef.current?.scale.set(
                radius,
                getMode() == Mode.createPoint ? 1 : radius,
                radius);
            }
          }
        }
      }}
      castShadow={true}
      receiveShadow={true}
      args={[
        soil(Shape, botSize) as Shape,
        { steps: 1, depth: soilDepth, bevelEnabled: false },
      ]}
      position={[
        threeSpace(0, bedLengthOuter),
        threeSpace(0, bedWidthOuter),
        -bedStartZ,
      ]}>
      {children}
    </Extrude>;
  };

  const drawnPoint = props.addPlantProps && props.addPlantProps.designer.drawnPoint;
  const soilZ = zZero(props.config) - props.config.soilHeight;

  return <Group name={"bed-group"}>
    <Detailed distances={detailLevels(props.config)}>
      <Bed>
        <MeshPhongMaterial
          map={bedWoodTexture} color={bedColor} side={DoubleSide} />
      </Bed>
      <Bed>
        <MeshPhongMaterial color={"#ad7039"} side={DoubleSide} />
      </Bed>
    </Detailed>
    <Group name={"distance-indicator-group"}
      visible={xyDimensions || props.activeFocus == "Planter bed"}>
      <DistanceIndicator
        start={{
          x: threeSpace(0, bedLengthOuter),
          y: threeSpace(0, bedWidthOuter) - 100,
          z: groundZ,
        }}
        end={{
          x: threeSpace(bedLengthOuter, bedLengthOuter),
          y: threeSpace(0, bedWidthOuter) - 100,
          z: groundZ,
        }} />
      <DistanceIndicator
        start={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(0, bedWidthOuter),
          z: groundZ,
        }}
        end={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(bedWidthOuter, bedWidthOuter),
          z: groundZ,
        }} />
    </Group>
    <Group visible={props.config.distanceIndicator == "bedHeight"}>
      <DistanceIndicator
        start={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(0, bedWidthOuter),
          z: groundZ,
        }}
        end={{
          x: threeSpace(bedLengthOuter, bedLengthOuter) + 100,
          y: threeSpace(0, bedWidthOuter),
          z: 0,
        }} />
    </Group>
    <Group name={"axes-group"} visible={axes}>
      <FarmbotAxes config={props.config} />
    </Group>
    <Box name={"lower-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
      position={[
        threeSpace(bedLengthOuter / 4, bedLengthOuter),
        threeSpace(-ccSupportSize / 2, bedWidthOuter),
        -Math.min(150, bedHeight / 2) - ccSupportSize / 2,
      ]}>
      <MeshPhongMaterial map={legWoodTexture} color={bedColor} side={DoubleSide} />
    </Box>
    <Box name={"upper-cc-support"}
      castShadow={true}
      receiveShadow={true}
      args={[bedLengthOuter / 2, ccSupportSize, ccSupportSize]}
      position={[
        threeSpace(bedLengthOuter * 3 / 4, bedLengthOuter),
        threeSpace(-ccSupportSize / 2, bedWidthOuter),
        -50 - ccSupportSize / 2,
      ]}>
      <MeshPhongMaterial map={legWoodTexture} color={bedColor} side={DoubleSide} />
    </Box>
    {HOVER_OBJECT_MODES.includes(getMode()) &&
      !isMobile() &&
      <Group ref={pointerPlantRef} position={[0, 0, 0]}>
        <Group position={[0, 0, soilZ]}>
          {DRAW_POINT_MODES.includes(getMode()) && props.addPlantProps &&
            drawnPoint &&
            <Group name={"add-point-hover-object-center"}>
              {(isUndefined(drawnPoint.cx) || isUndefined(drawnPoint.cy))
                ? <DrawnPoint
                  config={props.config}
                  designer={props.addPlantProps.designer}
                  usePosition={false} />
                : <Group name={"add-point-hover-object-radius"}>
                  {getMode() == Mode.createPoint
                    ? <Cylinder
                      ref={radiusRef}
                      rotation={[Math.PI / 2, 0, 0]}
                      args={[1, 1, 100, 32, 32, true]}>
                      <MeshPhongMaterial
                        color={drawnPoint.color}
                        side={DoubleSide}
                        transparent={true}
                        opacity={0.5} />
                    </Cylinder>
                    : <Sphere
                      ref={radiusRef}
                      renderOrder={1}
                      args={[1, 32, 32]}>
                      <MeshPhongMaterial
                        color={drawnPoint.color}
                        side={DoubleSide}
                        transparent={true}
                        opacity={0.5} />
                    </Sphere>}
                </Group>}
            </Group>}
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
      </Group>}
    <Detailed distances={detailLevels(props.config)}>
      <Soil addPlantProps={props.addPlantProps}>
        <MeshPhongMaterial map={soilTexture} color={soilColor}
          shininess={0} />
      </Soil>
      <Soil addPlantProps={props.addPlantProps}>
        <MeshPhongMaterial color={"#29231e"}
          shininess={0} />
      </Soil>
    </Detailed>
    {legXPositions.map((x, index) =>
      <Group key={index}>
        {legYPositions(index).map(y =>
          <Group name={"bed-leg"} key={y}
            position={[
              threeSpace(x, bedLengthOuter),
              threeSpace(y, bedWidthOuter),
              -bedZOffset / 2
              - (legsFlush ? bedHeight / 2 : bedHeight)
              + (casterHeight / 2),
            ]}>
            <Box name={"bed-leg-wood"}
              castShadow={true}
              receiveShadow={true}
              args={[
                legSize,
                legSize,
                bedZOffset + (legsFlush ? bedHeight : 0) - casterHeight,
              ]}>
              <MeshPhongMaterial map={legWoodTexture} color={bedColor} />
            </Box>
            <Caster config={props.config} />
          </Group>)}
      </Group>)}
    <UtilitiesPost config={props.config} activeFocus={props.activeFocus} />
    <Packaging config={props.config} />
  </Group>;
};
