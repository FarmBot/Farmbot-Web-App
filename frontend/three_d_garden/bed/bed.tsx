import React from "react";
import { Box, Detailed, Extrude, useTexture } from "@react-three/drei";
import {
  DoubleSide,
  Path as LinePath,
  Shape,
  RepeatWrapping,
} from "three";
import { range } from "lodash";
import { threeSpace, zZero, getColorFromBrightness } from "../helpers";
import { Config, detailLevels } from "../config";
import { ASSETS } from "../constants";
import { DistanceIndicator } from "../elements";
import { FarmbotAxes, Caster, UtilitiesPost, Packaging } from "./objects";
import { Group, MeshPhongMaterial } from "../components";
import {
  AxisNumberProperty, TaggedPlant,
} from "../../farm_designer/map/interfaces";
import { TaggedCurve, TaggedGenericPointer } from "farmbot";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { DesignerState } from "../../farm_designer/interfaces";
import { useNavigate } from "react-router";
import {
  BillboardRef,
  ImageRef,
  PointerObjects, PointerPlantRef, RadiusRef, soilClick, soilPointerMove,
  TorusRef,
  XCrosshairRef,
  YCrosshairRef,
} from "./objects/pointer_objects";

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
  mapPoints: TaggedGenericPointer[];
  addPlantProps?: AddPlantProps;
}

export const Bed = (props: BedProps) => {
  const {
    bedWidthOuter, bedLengthOuter, botSizeZ, bedHeight, bedZOffset,
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
  const pointerPlantRef: PointerPlantRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const radiusRef: RadiusRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const torusRef: TorusRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const billboardRef: BillboardRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const imageRef: ImageRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const xCrosshairRef: XCrosshairRef = React.useRef(null);

  // eslint-disable-next-line no-null/no-null
  const yCrosshairRef: YCrosshairRef = React.useRef(null);

  interface SoilProps {
    children: React.ReactElement;
    addPlantProps?: AddPlantProps;
  }

  const navigate = useNavigate();

  const Soil = ({ children, addPlantProps }: SoilProps) => {
    const soilDepth = bedHeight + zZero(props.config) - soilHeight;
    return <Extrude name={"soil"}
      onClick={addPlantProps &&
        soilClick({
          config: props.config,
          addPlantProps,
          pointerPlantRef,
          navigate,
        })}
      onPointerMove={addPlantProps &&
        soilPointerMove({
          addPlantProps,
          config: props.config,
          pointerPlantRef,
          radiusRef,
          torusRef,
          billboardRef,
          imageRef,
          xCrosshairRef,
          yCrosshairRef,
        })}
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
    {props.addPlantProps &&
      <PointerObjects
        pointerPlantRef={pointerPlantRef}
        radiusRef={radiusRef}
        torusRef={torusRef}
        billboardRef={billboardRef}
        imageRef={imageRef}
        xCrosshairRef={xCrosshairRef}
        yCrosshairRef={yCrosshairRef}
        config={props.config}
        addPlantProps={props.addPlantProps}
        mapPoints={props.mapPoints} />}
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
