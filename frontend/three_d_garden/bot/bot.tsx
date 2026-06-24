/* eslint-disable complexity */
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import {
  Cylinder, Extrude, Trail, Tube, useGLTF,
} from "@react-three/drei";
import {
  DoubleSide, ExtrudeGeometryOptions, Shape, RepeatWrapping,
} from "three";
import {
  easyCubicBezierCurve3, get3DPositionNoMirrorFunc,
  zDir as zDirFunc,
  zZero as zZeroFunc,
} from "../helpers";
import { Config, PositionConfig } from "../config";
import type { GLTF } from "three-stdlib";
import {
  ASSETS, HOVER_OBJECT_MODES, LIB_DIR, PartName,
} from "../constants";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { range } from "lodash";
import {
  CrossSlideFull, CrossSlideModel, CrossSlideV19Full, CrossSlideV19Model,
  GantryWheelPlate, GantryWheelPlateFull,
  MountedIdlerPulleyFull, MountedIdlerPulleyModel,
  VacuumPumpCoverFull, VacuumPumpCoverModel,
} from "./parts";
import { PowerSupply } from "./power_supply";
import { Group, Mesh, MeshPhongMaterial } from "../components";
import {
  ElectronicsBox, Bounds, Tools, Solenoid, XAxisWaterTube,
  CableCarrierX,
  CableCarrierSupportVertical,
  CableCarrierZ,
  CableCarrierY,
  CableCarrierSupportHorizontal,
  GantryBeam,
  CameraView,
} from "./components";
import { SlotWithTool } from "../../resources/interfaces";
import { WateringAnimations } from "./components/watering_animations";
import { FocusVisibilityGroup } from "../focus_transition";
import { useTextureVariant } from "../texture_variants";
import { WaterFlowTextureProvider } from "./components/water_stream";
import {
  ThreeDObjectHoverHandler, ThreeDObjectHoverLabelHandler,
  ThreeDObjectSelectionHandler,
} from "../selection_types";
import { clickWasDragged } from "../click_event";
import { Mode } from "../../farm_designer/map/interfaces";
import { getMode } from "../../farm_designer/map/util";

const xTrackPadding = 280;
const extrusionWidth = 20;
const utmRadius = 35;
const cameraMountOffset = {
  x: extrusionWidth - 8,
  y: utmRadius,
};
const distinguishableBlack = "#333";

type LeftBracket = GLTF & {
  nodes: { [PartName.leftBracket]: THREE.Mesh };
  materials: never;
}
type RightBracket = GLTF & {
  nodes: { [PartName.rightBracket]: THREE.Mesh };
  materials: never;
}
type ZStop = GLTF & {
  nodes: { [PartName.zStop]: THREE.Mesh };
  materials: never;
}
type BeltClip = GLTF & {
  nodes: { [PartName.beltClip]: THREE.Mesh };
  materials: never;
}
type UTM = GLTF & {
  nodes: { [PartName.utm]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type HousingVertical = GLTF & {
  nodes: { [PartName.housingVertical]: THREE.Mesh };
  materials: never;
}
type HorizontalMotorHousing = GLTF & {
  nodes: { [PartName.horizontalMotorHousing]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type ZAxisMotorMount = GLTF & {
  nodes: { [PartName.zAxisMotorMount]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type CameraMountHalf = GLTF & {
  nodes: { [PartName.cameraMountHalf]: THREE.Mesh };
  materials: never;
}
type XAxisCCMount = GLTF & {
  nodes: { [PartName.xAxisCCMount]: THREE.Mesh };
  materials: never;
}

interface XAxisCCMountModelProps {
  position: [number, number, number];
}

const XAxisCCMountModel = (props: XAxisCCMountModelProps) => {
  const xAxisCCMount =
    useGLTF(ASSETS.models.xAxisCCMount, LIB_DIR) as unknown as XAxisCCMount;
  return <Mesh name={"xCCMount"}
    position={props.position}
    rotation={[0, 0, Math.PI / 2]}
    scale={1000}
    geometry={xAxisCCMount.nodes[PartName.xAxisCCMount].geometry}>
    <MeshPhongMaterial color={"silver"} />
  </Mesh>;
};

export interface FarmbotModelProps {
  config: Config;
  configPosition: PositionConfig;
  activeFocus: string;
  getZ(x: number, y: number): number;
  trailReady?: boolean;
  toolSlots?: SlotWithTool[];
  mountedToolName?: string | undefined;
  dispatch?: Function;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  onToolSlotHoverObject?: ThreeDObjectHoverHandler;
  onHoverLabel?: ThreeDObjectHoverLabelHandler;
}

interface RequestedShapes {
  track: boolean;
  beam: boolean;
  beamV19: boolean;
  column: boolean;
  zAxis: boolean;
}

interface BotShapeCache {
  track?: Shape;
  beam?: Shape;
  beamV19?: Shape;
  column?: Shape;
  zAxis?: Shape;
}

const botShapeCache: BotShapeCache = {};

export const clearBotShapeCache = () => {
  botShapeCache.track = undefined;
  botShapeCache.beam = undefined;
  botShapeCache.beamV19 = undefined;
  botShapeCache.column = undefined;
  botShapeCache.zAxis = undefined;
};

const botGardenXY = (
  config: Config,
  gardenX: number,
  gardenY: number,
): [number, number] => {
  const position = get3DPositionNoMirrorFunc(config)({
    x: gardenX,
    y: gardenY,
  });
  return [position.x, position.y];
};

const botOuterXY = (
  config: Config,
  gardenX: number,
  outerY: number,
): [number, number] =>
  botGardenXY(config, gardenX, outerY - config.bedYOffset);

interface BotXYSubassemblyProps {
  config: Config;
  configPosition: PositionConfig;
}

const sameBotXYSubassemblyProps = <P extends BotXYSubassemblyProps>(
  prev: P,
  next: P,
) => {
  return prev.config === next.config &&
    prev.configPosition.x === next.configPosition.x &&
    prev.configPosition.y === next.configPosition.y;
};

const sameConfigFields = (
  prev: Config,
  next: Config,
  fields: (keyof Config)[],
) => fields.every(field => prev[field] === next[field]);

interface BotFrameSubassembliesProps
  extends BotXYSubassemblyProps {
  trackShape: Shape | undefined;
  columnShape: Shape | undefined;
}

const BOT_FRAME_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeX",
  "cableCarriers",
  "columnLength",
  "kitVersion",
  "tracks",
];

const sameBotFrameSubassembliesProps = (
  prev: BotFrameSubassembliesProps,
  next: BotFrameSubassembliesProps,
) =>
  sameConfigFields(prev.config, next.config, BOT_FRAME_CONFIG_FIELDS) &&
  prev.configPosition.x === next.configPosition.x &&
  prev.configPosition.y === next.configPosition.y &&
  prev.trackShape === next.trackShape &&
  prev.columnShape === next.columnShape;

const BotFrameSubassembliesBase = (props: BotFrameSubassembliesProps) => {
  const {
    bedWidthOuter, tracks, columnLength, botSizeX,
  } = props.config;
  const { x, y } = props.configPosition;
  const aluminumTexture = useTextureVariant(ASSETS.textures.aluminum, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.01, 0.0003],
  });
  const gantryWheelPlate =
    useGLTF(ASSETS.models.gantryWheelPlate, LIB_DIR) as unknown as GantryWheelPlateFull;
  const GantryWheelPlateComponent = GantryWheelPlate(gantryWheelPlate);
  const leftBracket = useGLTF(ASSETS.models.leftBracket, LIB_DIR) as unknown as LeftBracket;
  const rightBracket = useGLTF(ASSETS.models.rightBracket, LIB_DIR) as unknown as RightBracket;
  const isV19 = props.config.kitVersion == "v1.9";
  const crossSlide = useGLTF(isV19
    ? ASSETS.models.crossSlideV19
    : ASSETS.models.crossSlide, LIB_DIR);
  const beltClip = useGLTF(ASSETS.models.beltClip, LIB_DIR) as unknown as BeltClip;
  const horizontalMotorHousing = useGLTF(
    ASSETS.models.horizontalMotorHousing, LIB_DIR) as unknown as HorizontalMotorHousing;
  return <>
    {[0 - extrusionWidth, bedWidthOuter].map((outerY, index) => {
      const bedColumnYOffset =
        (tracks ? 0 : extrusionWidth) * (index == 0 ? 1 : -1);
      return <Group key={outerY}>
        <Extrude name={"columns"}
          castShadow={true}
          args={[
            props.columnShape,
            { steps: 1, depth: columnLength, bevelEnabled: false },
          ]}
          position={[
            ...botOuterXY(
              props.config,
              x - extrusionWidth - 23,
              outerY + bedColumnYOffset,
            ),
            30,
          ]}
          rotation={[0, 0, Math.PI / 2]}>
          <MeshPhongMaterial
            color={"white"}
            map={aluminumTexture}
            side={DoubleSide} />
        </Extrude>
        <Mesh name={index == 0 ? "leftBracket" : "rightBracket"}
          position={[
            ...botOuterXY(
              props.config,
              x - extrusionWidth - 23,
              outerY - (index == 0 ? 0 : 170) + bedColumnYOffset,
            ),
            columnLength - 30,
          ]}
          rotation={[Math.PI / 2, Math.PI / 2, 0]}
          scale={1000}
          geometry={index == 0
            ? leftBracket.nodes[PartName.leftBracket].geometry
            : rightBracket.nodes[PartName.rightBracket].geometry}>
          <MeshPhongMaterial color={"silver"} side={DoubleSide} />
        </Mesh>
        <Mesh name={index == 0 ? "leftMotor" : "rightMotor"}
          position={[
            ...botOuterXY(
              props.config,
              x - (index == 0 ? 58 : 88),
              outerY - (index == 0 ? 0 : -20) + bedColumnYOffset,
            ),
            columnLength + 70,
          ]}
          rotation={[Math.PI / 2, (index == 0 ? Math.PI : 0), Math.PI / 2]}
          scale={1000}
          geometry={undefined}
          material={undefined} />
        <Mesh name={index == 0 ? "leftMotor" : "rightMotor"}
          position={[
            ...botOuterXY(
              props.config,
              x - 79,
              outerY - (index == 0 ? 5 : -25) + bedColumnYOffset,
            ),
            columnLength + 80,
          ]}
          rotation={[0, Math.PI, (index == 0 ? 0 : Math.PI)]}
          scale={1000}
          geometry={
            horizontalMotorHousing.nodes[PartName.horizontalMotorHousing].geometry}>
          <MeshPhongMaterial color={"silver"} side={DoubleSide} />
        </Mesh>
        <Cylinder name={"motorPulley"}
          args={[8, 8, 40]}
          position={[
            ...botOuterXY(
              props.config,
              x - 74,
              outerY - (index == 0 ? 5 : -25) + bedColumnYOffset,
            ),
            columnLength + 55,
          ]}
          rotation={[0, 0, 0]}>
          <MeshPhongMaterial color={"#999"} />
        </Cylinder>
        {tracks && <Extrude name={"tracks"}
          castShadow={true}
          args={[
            props.trackShape,
            { steps: 1, depth: botSizeX + xTrackPadding, bevelEnabled: false },
          ]}
          position={[
            ...botOuterXY(
              props.config,
              index == 0
                ? botSizeX + xTrackPadding / 2 - 10
                : -xTrackPadding / 2 - 10,
              outerY + (index == 0 ? 2.5 : 17.5),
            ),
            2,
          ]}
          rotation={[
            index == 0 ? -Math.PI / 2 : -Math.PI / 2,
            index == 0 ? -Math.PI / 2 : Math.PI / 2,
            0,
          ]}>
          <MeshPhongMaterial
            color={"white"}
            map={aluminumTexture}
            side={DoubleSide} />
        </Extrude>}
        <Mesh name={"xStopMin"}
          position={[
            ...botOuterXY(
              props.config,
              -143,
              outerY + 10 + bedColumnYOffset,
            ),
            2 + (index == 0 ? 0 : 5),
          ]}
          rotation={[
            0,
            index == 0 ? 0 : Math.PI,
            (index == 0 ? 1 : -1) * Math.PI / 2,
          ]}
          scale={1000}
          geometry={beltClip.nodes[PartName.beltClip].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
        <Mesh name={"xStopMax"}
          position={[
            ...botOuterXY(
              props.config,
              botSizeX - 16 + xTrackPadding / 2,
              outerY + 10 + bedColumnYOffset,
            ),
            2 + (index == 0 ? 5 : 0),
          ]}
          rotation={[
            0,
            index == 0 ? Math.PI : 0,
            (index == 0 ? 1 : -1) * Math.PI / 2,
          ]}
          scale={1000}
          geometry={beltClip.nodes[PartName.beltClip].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
        <GantryWheelPlateComponent name={"gantryWheelPlate"}
          position={[
            ...botOuterXY(
              props.config,
              x - 53,
              outerY + (index == 0 ? 0 : extrusionWidth + 5)
              - 2 - (index == 0 ? 1 : 0)
              + bedColumnYOffset,
            ),
            -30,
          ]}
          rotation={[0, 0, Math.PI / 2 + (index == 0 ? Math.PI : 0)]}
          scale={[1000, 1000 * (index == 0 ? -1 : 1), 1000]} />
      </Group>;
    })}
    {props.config.cableCarriers &&
    <XAxisCCMountModel
      position={[
        ...botOuterXY(props.config, x - 43, -12),
        -40,
      ]} />}
    {props.config.cableCarriers &&
    <CableCarrierX
      config={props.config}
      configPosition={props.configPosition} />}
    {isV19
      ? <CrossSlideV19Model
        model={crossSlide as unknown as CrossSlideV19Full}
        name={"crossSlide"}
        position={[
          ...botGardenXY(props.config, x - 12.5, y + 45),
          columnLength + 97,
        ]}
        rotation={[0, 0, Math.PI / 2]}
        scale={1000} />
      : <CrossSlideModel
        model={crossSlide as unknown as CrossSlideFull}
        name={"crossSlide"}
        position={[
          ...botGardenXY(props.config, x - 12.5, y + 5),
          columnLength + 105,
        ]}
        rotation={[0, 0, Math.PI / 2]}
        scale={1000} />}
  </>;
};

const BotFrameSubassemblies = React.memo(
  BotFrameSubassembliesBase,
  sameBotFrameSubassembliesProps,
);

interface BotGantrySubassembliesProps
  extends BotXYSubassemblyProps {
  beamShape: Shape | undefined;
}

const BOT_GANTRY_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeY",
  "cableCarriers",
  "columnLength",
  "kitVersion",
  "light",
];

const sameBotGantrySubassembliesProps = (
  prev: BotGantrySubassembliesProps,
  next: BotGantrySubassembliesProps,
) =>
  sameConfigFields(prev.config, next.config, BOT_GANTRY_CONFIG_FIELDS) &&
  prev.configPosition.x === next.configPosition.x &&
  prev.configPosition.y === next.configPosition.y &&
  prev.beamShape === next.beamShape;

const BotGantrySubassembliesBase = (props: BotGantrySubassembliesProps) => {
  const {
    botSizeY, bedYOffset, columnLength,
  } = props.config;
  const { x, y } = props.configPosition;
  const aluminumTexture = useTextureVariant(ASSETS.textures.aluminum, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.01, 0.0003],
  });
  const beltClip = useGLTF(ASSETS.models.beltClip, LIB_DIR) as unknown as BeltClip;
  const yBeltPath = React.useCallback(() => {
    const radius = 12;
    const path = new Shape();
    path.moveTo(0, 0);
    path.lineTo(0, y + 30);
    path.arc(radius, -5, radius, Math.PI, Math.PI / 2, true);
    path.lineTo(45, y + 30);
    path.arc(0, 10, 10, -Math.PI / 2, Math.PI / 4);
    path.lineTo(0, y + 100);
    path.arc(radius, 5, radius, (-3 / 4) * Math.PI, Math.PI, true);
    path.lineTo(0, botSizeY + 220);
    path.lineTo(-2, botSizeY + 220);
    path.lineTo(-2, y + 100);
    path.arc(radius, 4, radius, Math.PI, (-3 / 4) * Math.PI);
    path.lineTo(45, y + 50);
    path.arc(0, -10, 8, Math.PI / 4, -Math.PI / 2, true);
    path.lineTo(radius, y + 40);
    path.arc(-2, -radius, radius, Math.PI / 2, Math.PI);
    path.lineTo(-2, 0);
    return path;
  }, [botSizeY, y]);
  const yBeltArgs = React.useMemo(() => [
    yBeltPath(),
    { steps: 1, depth: 6, bevelEnabled: false },
  ] as [Shape, ExtrudeGeometryOptions], [yBeltPath]);
  return <>
    <GantryBeam
      config={props.config}
      configPosition={props.configPosition}
      aluminumTexture={aluminumTexture}
      beamShape={props.beamShape} />
    {props.config.cableCarriers &&
    <CableCarrierSupportHorizontal
      config={props.config}
      configPosition={props.configPosition} />}
    {props.config.cableCarriers &&
    <CableCarrierY
      config={props.config}
      configPosition={props.configPosition} />}
    <Mesh name={"yStopMin"}
      position={[
        ...botOuterXY(props.config, x - extrusionWidth - 9, bedYOffset - 125),
        columnLength + 40 + extrusionWidth * 3,
      ]}
      rotation={[0, 0, Math.PI]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Extrude name={"yBelt"}
      args={yBeltArgs}
      position={[
        ...botGardenXY(props.config, x - 25.5, -100),
        columnLength + 100,
      ]}
      rotation={[0, -Math.PI / 2, 0]}>
      <MeshPhongMaterial color={distinguishableBlack} />
    </Extrude>
    <Mesh name={"yStopMax"}
      position={[
        ...botOuterXY(
          props.config,
          x - extrusionWidth - 9,
          botSizeY + bedYOffset + 135,
        ),
        columnLength + 40 + extrusionWidth * 3 + 5,
      ]}
      rotation={[0, Math.PI, 0]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
  </>;
};

const BotGantrySubassemblies = React.memo(
  BotGantrySubassembliesBase,
  sameBotGantrySubassembliesProps,
);

interface BotElectronicsSubassemblyProps extends BotXYSubassemblyProps {
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
}

const botElectronicsSubassemblyPropsEqual = (
  prev: BotElectronicsSubassemblyProps,
  next: BotElectronicsSubassemblyProps,
) =>
  sameBotXYSubassemblyProps(prev, next) &&
  prev.onSelectObject === next.onSelectObject &&
  prev.onHoverObject === next.onHoverObject;

const BotElectronicsSubassemblyBase = (props: BotElectronicsSubassemblyProps) =>
  <ElectronicsBox
    config={props.config}
    configPosition={props.configPosition}
    onSelectObject={props.onSelectObject}
    onHoverObject={props.onHoverObject} />;

const BotElectronicsSubassembly = React.memo(
  BotElectronicsSubassemblyBase,
  botElectronicsSubassemblyPropsEqual,
);

interface BotVerticalToolheadSubassemblyProps
  extends BotXYSubassemblyProps {
  zAxisShape: Shape | undefined;
  getZ(x: number, y: number): number;
  trailReady: boolean;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
}

const BOT_VERTICAL_TOOLHEAD_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeZ",
  "cableCarriers",
  "cameraView",
  "columnLength",
  "imgCenterX",
  "imgCenterY",
  "imgOffsetX",
  "imgOffsetY",
  "imgOrigin",
  "imgRotation",
  "imgScale",
  "kitVersion",
  "laser",
  "lastImageCapture",
  "negativeZ",
  "perspective",
  "trail",
  "zAxisLength",
  "zGantryOffset",
];

const sameBotVerticalToolheadSubassemblyProps = (
  prev: BotVerticalToolheadSubassemblyProps,
  next: BotVerticalToolheadSubassemblyProps,
) =>
  sameConfigFields(prev.config, next.config, BOT_VERTICAL_TOOLHEAD_CONFIG_FIELDS) &&
  prev.configPosition.x === next.configPosition.x &&
  prev.configPosition.y === next.configPosition.y &&
  prev.configPosition.z === next.configPosition.z &&
  prev.getZ === next.getZ &&
  prev.onSelectObject === next.onSelectObject &&
  prev.onHoverObject === next.onHoverObject &&
  prev.trailReady === next.trailReady &&
  prev.zAxisShape === next.zAxisShape;

const BotVerticalToolheadSubassemblyBase =
  (props: BotVerticalToolheadSubassemblyProps) => {
    const config = props.config;
    const {
      botSizeZ, trail, laser, columnLength, zAxisLength, zGantryOffset,
    } = config;
    const { x, y, z } = props.configPosition;
    const zZero = zZeroFunc(config);
    const zDir = zDirFunc(config);
    const get3DPosition = get3DPositionNoMirrorFunc(config);
    const gardenXY = (gardenX: number, gardenY: number): [number, number] => {
      const position = get3DPosition({ x: gardenX, y: gardenY });
      return [position.x, position.y];
    };
    const isV19 = config.kitVersion == "v1.9";
    const zStop = useGLTF(isV19
      ? ASSETS.models.mountedIdlerPulley
      : ASSETS.models.zStop, LIB_DIR);
    const utm = useGLTF(ASSETS.models.utm, LIB_DIR) as unknown as UTM;
    const housingVertical = useGLTF(
      ASSETS.models.housingVertical, LIB_DIR) as unknown as HousingVertical;
    const zAxisMotorMount = useGLTF(
      ASSETS.models.zAxisMotorMount, LIB_DIR) as unknown as ZAxisMotorMount;
    const vacuumPumpCover = useGLTF(
      ASSETS.models.vacuumPumpCover, LIB_DIR) as unknown as VacuumPumpCoverFull;
    const cameraMountHalf = useGLTF(
      ASSETS.models.cameraMountHalf, LIB_DIR) as unknown as CameraMountHalf;
    const aluminumTexture = useTextureVariant(ASSETS.textures.aluminum, {
      wrapS: RepeatWrapping,
      wrapT: RepeatWrapping,
      repeat: [0.01, 0.0003],
    });
    const distanceToSoil = -props.getZ(x, y) - zDir * z;
    const defaultTrailWidth = config.perspective ? 500 : 0.1;
    const airTubeEndPosition = (kitVersion: string): [number, number, number] => {
      switch (kitVersion) {
        case "v1.7":
          return [...gardenXY(x + 69, y + 100), zZero - zDir * z + 245];
        case "v1.8":
        default:
          return [...gardenXY(x + 24, y), zZero - zDir * z + 245];
      }
    };
    const vacuumPumpCoverRotation = (kitVersion: string): [number, number, number] => {
      switch (kitVersion) {
        case "v1.7":
          return [0, 0, Math.PI / 2];
        case "v1.8":
        default:
          return [0, 0, -Math.PI / 2];
      }
    };
    const vacuumPumpCoverPosition = (kitVersion: string): [number, number, number] => {
      switch (kitVersion) {
        case "v1.7":
          return [...gardenXY(x + 1, y + 55), zZero - zDir * z + 490];
        case "v1.8":
        default:
          return [...gardenXY(x - 9, y + 110), zZero + columnLength + 25];
      }
    };
    const cameraMountPosition = new THREE.Vector3(
      ...gardenXY(x + cameraMountOffset.x, y + cameraMountOffset.y),
      zZero - zDir * z - 140 + zGantryOffset + 20,
    );
    const zStopComponent = (
      name: string,
      position: [number, number, number],
      lower = false,
    ) => {
      if (isV19) {
        const mountedIdlerPulleyPosition: [number, number, number] = [
          position[0],
          position[1],
          position[2] - 20,
        ];
        return <MountedIdlerPulleyModel
          model={zStop as unknown as MountedIdlerPulleyFull}
          name={name}
          position={mountedIdlerPulleyPosition}
          rotation={[0, 0, -Math.PI / 2]}
          scale={1000}
          lower={lower} />;
      }
      return <Mesh name={name}
        position={position}
        rotation={[0, Math.PI / 2, 0]}
        scale={1000}
        geometry={(zStop as unknown as ZStop).nodes[PartName.zStop].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>;
    };
    const selectUtm = (event: ThreeEvent<MouseEvent>) => {
      if (clickWasDragged(event)) { return; }
      if ([...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
        return;
      }
      if (props.onSelectObject) {
        props.onSelectObject({ kind: "utm", id: 0 }) !== false &&
          event.stopPropagation?.();
      }
    };
    const selectCamera = (event: ThreeEvent<MouseEvent>) => {
      if (clickWasDragged(event)) { return; }
      if ([...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
        return;
      }
      if (props.onSelectObject) {
        props.onSelectObject({ kind: "camera", id: 0 }) !== false &&
          event.stopPropagation?.();
      }
    };
    const utmComponent = <Group name={"UTM"}
      position={[
        ...gardenXY(x, y),
        zZero - zDir * z,
      ]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}>
      <Mesh
        geometry={utm.nodes.M5_Barb.geometry}
        material={utm.materials.PaletteMaterial001}
        position={[0.015, 0.009, 0.036]}
        onClick={selectUtm}
        onPointerOver={() => props.onHoverObject?.(true)}
        onPointerOut={() => props.onHoverObject?.(false)}
        rotation={[0, 0, 2.094]} />
    </Group>;

    return <>
      <Extrude name={"z-axis"}
        castShadow={true}
        args={[
          props.zAxisShape,
          { steps: 1, depth: zAxisLength, bevelEnabled: false },
        ]}
        position={[
          ...gardenXY(x - 11, y + utmRadius),
          zZero - zDir * z,
        ]}
        rotation={[0, 0, 0]}>
        <MeshPhongMaterial color={"white"} map={aluminumTexture} side={DoubleSide} />
      </Extrude>
      {!isV19 && <Group name={"zMotor"}>
        <Mesh name={"zMotorHousing"}
          position={[
            ...gardenXY(x - 7, y + utmRadius - 46),
            zZero - zDir * z + zAxisLength - 80,
          ]}
          rotation={[0, 0, Math.PI]}
          scale={1000}
          geometry={housingVertical.nodes[PartName.housingVertical].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>
        <Mesh name={"zMotor"}
          position={[
            ...gardenXY(x - 1, y + utmRadius - 5),
            zZero - zDir * z + zAxisLength - 140,
          ]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={1000}
          geometry={undefined}
          material={undefined} />
        <Mesh name={"zMotorMount"}
          position={[
            ...gardenXY(x - 6, y + utmRadius - 65),
            zZero - zDir * z + zAxisLength - 80,
          ]}
          rotation={[0, 0, Math.PI]}
          scale={1000}
          geometry={zAxisMotorMount.nodes[PartName.zAxisMotorMount].geometry}>
          <MeshPhongMaterial color={"silver"} side={DoubleSide} />
        </Mesh>
        <Cylinder name={"motorShaft"}
          args={[2.5, 2.5, 40]}
          position={[
            ...gardenXY(x - 6, y + utmRadius - 65),
            zZero - zDir * z + zAxisLength - 80,
          ]}
          rotation={[Math.PI / 2, 0, 0]}>
          <MeshPhongMaterial color={"#999"} />
        </Cylinder>
      </Group>}
      {!isV19 && <Mesh name={"shaftCoupler"}
        position={[
          ...gardenXY(x - 6, y - 30),
          zZero - zDir * z + zAxisLength - 120,
        ]}
        rotation={[0, 0, 0]}
        scale={1000}
        geometry={undefined}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>}
      {!isV19 && <Cylinder name={"shaftCoupler"}
        args={[10, 10, 25]}
        position={[
          ...gardenXY(x - 6, y - 30),
          zZero - zDir * z + zAxisLength - 120 + 25 / 2,
        ]}
        rotation={[Math.PI / 2, 0, 0]}>
        <MeshPhongMaterial color={"silver"} />
      </Cylinder>}
      {!isV19 && <Cylinder name={"leadscrew"}
        material-color={"#555"}
        args={[4, 4, zAxisLength - 200]}
        position={[
          ...gardenXY(x - 5, y - 30),
          zZero - zDir * z + zAxisLength / 2,
        ]}
        rotation={[Math.PI / 2, 0, 0]} />}
      {config.cableCarriers &&
      <CableCarrierSupportVertical
        config={config}
        configPosition={props.configPosition} />}
      {config.cableCarriers &&
      <CableCarrierZ config={config}
        configPosition={props.configPosition} />}
      {zStopComponent("zStopMax", [
        ...gardenXY(x - 16, y + utmRadius + extrusionWidth / 2),
        zZero - zDir * z - 30 + zGantryOffset,
      ], true)}
      {zStopComponent("zStopMin", [
        ...gardenXY(x - 16, y + utmRadius + extrusionWidth / 2),
        zZero - zDir * z + botSizeZ + 140 + zGantryOffset,
      ])}
      <Mesh name={"vacuumPump"}
        position={[
          ...gardenXY(x + 17, y),
          zZero - zDir * z + 40,
        ]}
        rotation={[0, 0, Math.PI / 2]}
        scale={1000}
        geometry={undefined}
        material={undefined} />
      <Tube name={"air-tube"}
        castShadow={true}
        receiveShadow={true}
        args={[easyCubicBezierCurve3(
          [
            ...gardenXY(x + 17, y),
            zZero - zDir * z + 35,
          ],
          [0, 0, 100],
          [0, 0, -200],
          airTubeEndPosition(config.kitVersion),
        ), 20, 5, 8]}>
        <MeshPhongMaterial
          color={"white"}
          transparent={true}
          opacity={0.75}
        />
      </Tube>
      <VacuumPumpCoverModel
        model={vacuumPumpCover}
        rotation={vacuumPumpCoverRotation(config.kitVersion)}
        scale={1000}
        position={vacuumPumpCoverPosition(config.kitVersion)} />
      <Group name={"camera"}
        onClick={selectCamera}
        onPointerOver={() => props.onHoverObject?.(true)}
        onPointerOut={() => props.onHoverObject?.(false)}
        rotation={[Math.PI, 0, 0]}
        position={cameraMountPosition}>
        {!isV19 && <Mesh name={"cameraMount"}
          rotation={[0, 0, 0]}
          position={[0, 0, -40]}
          scale={1000}
          geometry={cameraMountHalf.nodes[PartName.cameraMountHalf].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>}
        {!isV19 && <Mesh name={"cameraMount"}
          rotation={[0, Math.PI, 0]}
          scale={1000}
          geometry={cameraMountHalf.nodes[PartName.cameraMountHalf].geometry}>
          <MeshPhongMaterial color={"silver"} />
        </Mesh>}
      </Group>
      <CameraView
        config={config}
        configPosition={props.configPosition}
        cameraMountPosition={cameraMountPosition}
        distanceToSoil={-props.getZ(x - 11, y) - zDir * z} />
      {props.trailReady && trail
        ? <Trail
          width={defaultTrailWidth}
          attenuation={t => Math.pow(t, 3)}
          color={"red"}
          length={100}
          decay={0.5}
          local={false}
          stride={0}
          interval={1}>
          {utmComponent}
        </Trail>
        : utmComponent}
      <Cylinder
        visible={laser}
        material-color={"red"}
        args={[5, 5, distanceToSoil]}
        position={[
          ...gardenXY(x, y),
          zZero - zDir * z - distanceToSoil / 2,
        ]}
        rotation={[Math.PI / 2, 0, 0]} />
    </>;
  };

const BotVerticalToolheadSubassembly = React.memo(
  BotVerticalToolheadSubassemblyBase,
  sameBotVerticalToolheadSubassemblyProps,
);

const BotBedUtilitySubassembliesBase = (props: { config: Config }) =>
  <>
    <PowerSupply config={props.config} />
    <XAxisWaterTube config={props.config} />
  </>;

const BotBedUtilitySubassemblies =
  React.memo(BotBedUtilitySubassembliesBase);

export const Bot = (props: FarmbotModelProps) =>
  props.config.bot ? <EnabledBot {...props} /> : undefined;

const EnabledBot = (props: FarmbotModelProps) => {
  const config = props.config;
  const { tracks } = props.config;
  const isV19 = config.kitVersion == "v1.9";
  const [trackShape, setTrackShape] =
    useState<Shape | undefined>(() => botShapeCache.track);
  const [beamShape, setBeamShape] =
    useState<Shape | undefined>(() => botShapeCache.beam);
  const [beamV19Shape, setBeamV19Shape] =
    useState<Shape | undefined>(() => botShapeCache.beamV19);
  const [columnShape, setColumnShape] =
    useState<Shape | undefined>(() => botShapeCache.column);
  const [zAxisShape, setZAxisShape] =
    useState<Shape | undefined>(() => botShapeCache.zAxis);
  const requestedShapes = React.useRef<RequestedShapes>({
    track: false,
    beam: false,
    beamV19: false,
    column: false,
    zAxis: false,
  });
  useEffect(() => {
    let loader: SVGLoader | undefined;
    const getLoader = () => {
      loader ||= new SVGLoader();
      return loader;
    };
    if (tracks && !trackShape && !requestedShapes.current.track) {
      requestedShapes.current.track = true;
      getLoader().load(ASSETS.shapes.track,
        svg => {
          const smallCutout = SVGLoader.createShapes(svg.paths[0])[0];
          const largeCutout = SVGLoader.createShapes(svg.paths[1])[0];
          const outline = SVGLoader.createShapes(svg.paths[2])[0];
          outline.holes.push(smallCutout);
          outline.holes.push(largeCutout);
          botShapeCache.track = outline;
          setTrackShape(outline);
        });
    }
    if (!isV19 && !beamShape && !requestedShapes.current.beam) {
      requestedShapes.current.beam = true;
      getLoader().load(ASSETS.shapes.beam,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          range(1, svg.paths.length).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          botShapeCache.beam = outline;
          setBeamShape(outline);
        });
    }
    if (isV19 && !beamV19Shape && !requestedShapes.current.beamV19) {
      requestedShapes.current.beamV19 = true;
      getLoader().load(ASSETS.shapes.beamV19,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          range(1, svg.paths.length).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          botShapeCache.beamV19 = outline;
          setBeamV19Shape(outline);
        });
    }
    if (!columnShape && !requestedShapes.current.column) {
      requestedShapes.current.column = true;
      getLoader().load(ASSETS.shapes.column,
        svg => {
          const outline = SVGLoader.createShapes(svg.paths[3])[0];
          range(3).map(i => {
            const hole = SVGLoader.createShapes(svg.paths[i])[0];
            outline.holes.push(hole);
          });
          botShapeCache.column = outline;
          setColumnShape(outline);
        });
    }
    if (!zAxisShape && !requestedShapes.current.zAxis) {
      requestedShapes.current.zAxis = true;
      getLoader().load(ASSETS.shapes.zAxis,
        svg => {
          const hole = SVGLoader.createShapes(svg.paths[1])[0];
          const outline = SVGLoader.createShapes(svg.paths[0])[0];
          outline.holes.push(hole);
          botShapeCache.zAxis = outline;
          setZAxisShape(outline);
        });
    }
  }, [
    beamShape,
    beamV19Shape,
    columnShape,
    isV19,
    trackShape,
    tracks,
    zAxisShape,
  ]);
  const trailReady = props.trailReady !== false;

  const botModel = <FocusVisibilityGroup name={"bot"} keepMounted={true}
    preserveDepthWrite={true}
    visible={props.activeFocus != "Planter bed"}>
    <BotFrameSubassemblies
      config={config}
      configPosition={props.configPosition}
      trackShape={trackShape}
      columnShape={columnShape} />
    <BotVerticalToolheadSubassembly
      config={config}
      configPosition={props.configPosition}
      getZ={props.getZ}
      onSelectObject={props.onSelectObject}
      onHoverObject={props.onHoverObject}
      trailReady={trailReady}
      zAxisShape={zAxisShape} />
    <BotGantrySubassemblies
      config={config}
      configPosition={props.configPosition}
      beamShape={isV19 ? beamV19Shape : beamShape} />
    <Solenoid config={config} configPosition={props.configPosition} />
    <BotElectronicsSubassembly
      config={config}
      configPosition={props.configPosition}
      onSelectObject={props.onSelectObject}
      onHoverObject={props.onHoverObject} />
    <Tools
      dispatch={props.dispatch}
      config={config}
      configPosition={props.configPosition}
      getZ={props.getZ}
      toolSlots={props.toolSlots}
      onSelectObject={props.onSelectObject}
      onHoverObject={props.onHoverObject}
      onToolSlotHoverObject={props.onToolSlotHoverObject}
      onHoverLabel={props.onHoverLabel}
      mountedToolName={props.mountedToolName} />
    {config.waterFlow &&
      <React.Suspense fallback={undefined}>
        <WateringAnimations
          waterFlow={config.waterFlow}
          config={config}
          configPosition={props.configPosition}
          getZ={props.getZ} />
      </React.Suspense>}
    <BotBedUtilitySubassemblies config={config} />
    {(config.bounds || config.zDimension || !!config.distanceIndicator) &&
    <Bounds config={config} configPosition={props.configPosition} />}
  </FocusVisibilityGroup>;
  return <WaterFlowTextureProvider waterFlow={config.waterFlow}>
    {botModel}
  </WaterFlowTextureProvider>;
};
