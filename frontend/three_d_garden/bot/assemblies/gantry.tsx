import React from "react";
import * as THREE from "three";
import { Cylinder, Extrude, useGLTF } from "@react-three/drei";
import { DoubleSide, RepeatWrapping, Shape } from "three";
import type { GLTF } from "three-stdlib";
import { Config, PositionConfig } from "../../config";
import { ASSETS, LIB_DIR, PartName } from "../../constants";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { useTextureVariant } from "../../texture_variants";
import {
  GantryWheelPlate, GantryWheelPlateFull,
  LeftGantryCornerBracketFull, LeftGantryCornerBracketModel,
  MountedIdlerPulleyFull, MountedIdlerPulleyModel,
  RightGantryCornerBracketFull, RightGantryCornerBracketModel,
} from "../parts";
import {
  CableCarrierSupportHorizontal, ElectronicsBox, GantryBeam,
  Solenoid,
} from "../components";
import {
  ThreeDObjectHoverHandler, ThreeDObjectSelectionHandler,
} from "../../selection_types";
import { BotVersion } from "../bot_versions";
import { EXTRUSION_WIDTH, machineOuterY } from "./constants";

const BASE_COLUMN_LENGTH = 500;

type LeftBracket = GLTF & {
  nodes: { [PartName.leftBracket]: THREE.Mesh };
  materials: never;
}
type RightBracket = GLTF & {
  nodes: { [PartName.rightBracket]: THREE.Mesh };
  materials: never;
}
type BeltClip = GLTF & {
  nodes: { [PartName.beltClip]: THREE.Mesh };
  materials: never;
}
type HorizontalMotorHousing = GLTF & {
  nodes: { [PartName.horizontalMotorHousing]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type XAxisCCMount = GLTF & {
  nodes: { [PartName.xAxisCCMount]: THREE.Mesh };
  materials: never;
}

const XAxisCCMountModel = (props: { bedYOffset: number }) => {
  const model = useGLTF(
    ASSETS.models.xAxisCCMount,
    LIB_DIR,
  ) as unknown as XAxisCCMount;
  return <Mesh name={"xCCMount"}
    position={[-43, -12 - props.bedYOffset, -40]}
    rotation={[0, 0, Math.PI / 2]}
    scale={1000}
    geometry={model.nodes[PartName.xAxisCCMount].geometry}>
    <MeshPhongMaterial color={"silver"} />
  </Mesh>;
};

interface HorizontalMotorHousingModelProps {
  name: "leftMotor" | "rightMotor";
  position: [number, number, number];
  rotation: [number, number, number];
}

const HorizontalMotorHousingModel =
  (props: HorizontalMotorHousingModelProps) => {
    const model = useGLTF(
      ASSETS.models.horizontalMotorHousing,
      LIB_DIR,
    ) as unknown as HorizontalMotorHousing;
    return <Mesh name={props.name}
      position={props.position}
      rotation={props.rotation}
      scale={1000}
      geometry={model.nodes[PartName.horizontalMotorHousing].geometry}>
      <MeshPhongMaterial color={"silver"} side={DoubleSide} />
    </Mesh>;
  };

export interface GantryAssemblyProps {
  config: Config;
  configPosition: PositionConfig;
  version: BotVersion;
  columnShape: Shape | undefined;
  beamShape: Shape | undefined;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
}

interface GantrySideProps {
  aluminumTexture: THREE.Texture;
  columnShape: Shape | undefined;
  config: Config;
  index: number;
  leftBracket: LeftBracket;
  leftBracketV19: LeftGantryCornerBracketFull;
  outerY: number;
  rightBracket: RightBracket;
  rightBracketV19: RightGantryCornerBracketFull;
  version: BotVersion;
  WheelPlate: ReturnType<typeof GantryWheelPlate>;
}

const GantryCornerBracket = (props: GantrySideProps & {
  bedColumnYOffset: number;
}) => {
  const { config, index, outerY, version } = props;
  const sideY = (value: number) => machineOuterY(config, value);
  if (version.number == "v1.9" && index == 0) {
    return <LeftGantryCornerBracketModel
      model={props.leftBracketV19}
      name={"leftBracket"}
      position={[-38, sideY(outerY + props.bedColumnYOffset - 35),
        config.columnLength - 15]}
      rotation={[0, 0, Math.PI / 2]} />;
  }
  if (version.number == "v1.9") {
    return <RightGantryCornerBracketModel
      model={props.rightBracketV19}
      name={"rightBracket"}
      position={[-38, sideY(outerY - 10 + props.bedColumnYOffset),
        config.columnLength + 80]}
      rotation={[0, 0, Math.PI / 2]} />;
  }
  return <Mesh name={index == 0 ? "leftBracket" : "rightBracket"}
    position={[-43, sideY(
      outerY - (index == 0 ? 0 : 170) + props.bedColumnYOffset,
    ), config.columnLength - 30]}
    rotation={[Math.PI / 2, Math.PI / 2, 0]}
    scale={1000}
    geometry={index == 0
      ? props.leftBracket.nodes[PartName.leftBracket].geometry
      : props.rightBracket.nodes[PartName.rightBracket].geometry}>
    <MeshPhongMaterial color={"silver"} side={DoubleSide} />
  </Mesh>;
};

const GantrySide = (props: GantrySideProps) => {
  const { config, index, outerY, version, WheelPlate } = props;
  const bedColumnYOffset =
    (config.tracks ? 0 : EXTRUSION_WIDTH) * (index == 0 ? 1 : -1);
  const sideY = (value: number) => machineOuterY(config, value);
  return <Group>
    <Extrude name={"columns"}
      castShadow={true}
      args={[
        props.columnShape,
        {
          steps: 1,
          depth: config.columnLength
            + version.columnLength
            - BASE_COLUMN_LENGTH,
          bevelEnabled: false,
        },
      ]}
      position={[
        -43,
        sideY(outerY + bedColumnYOffset),
        version.columnBaseZ,
      ]}
      rotation={[0, 0, Math.PI / 2]}>
      <MeshPhongMaterial color={"white"}
        map={props.aluminumTexture}
        side={DoubleSide} />
    </Extrude>
    <GantryCornerBracket {...props}
      bedColumnYOffset={bedColumnYOffset} />
    {version.gantry == "v1.7" && <HorizontalMotorHousingModel
      name={index == 0 ? "leftMotor" : "rightMotor"}
      position={[-73, sideY(
        outerY - (index == 0 ? 5 : -25) + bedColumnYOffset,
      ), config.columnLength + 80]}
      rotation={[0, Math.PI, index == 0 ? 0 : Math.PI]} />}
    {version.gantry == "v1.7" && <Cylinder name={"motorPulley"}
      args={[8, 8, 40]}
      position={[-73, sideY(
        outerY - (index == 0 ? 5 : -25) + bedColumnYOffset,
      ), config.columnLength + 55]}>
      <MeshPhongMaterial color={"#999"} />
    </Cylinder>}
    <WheelPlate name={"gantryWheelPlate"}
      position={[-53, sideY(
        outerY + (index == 0 ? 0 : EXTRUSION_WIDTH + 5)
        - 2 - (index == 0 ? 1 : 0) + bedColumnYOffset,
      ), -30]}
      rotation={[0, 0, Math.PI / 2 + (index == 0 ? Math.PI : 0)]}
      mirrorY={index == 0} />
  </Group>;
};

const GantryAssemblyBase = (props: GantryAssemblyProps) => {
  const { config, version } = props;
  const { beamLength, bedWidthOuter, botSizeY, columnLength } = config;
  const aluminumTexture = useTextureVariant(ASSETS.textures.aluminum, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.01, 0.0003],
  });
  const wheelPlate = useGLTF(
    version.number == "v1.9"
      ? ASSETS.models.gantryWheelPlateV19
      : ASSETS.models.gantryWheelPlate,
    LIB_DIR,
  ) as unknown as GantryWheelPlateFull;
  const GantryWheelPlateComponent = GantryWheelPlate(
    wheelPlate,
    version.number == "v1.9",
  );
  const leftBracket = useGLTF(
    ASSETS.models.leftBracket,
    LIB_DIR,
  ) as unknown as LeftBracket;
  const rightBracket = useGLTF(
    ASSETS.models.rightBracket,
    LIB_DIR,
  ) as unknown as RightBracket;
  const leftBracketV19 = useGLTF(
    ASSETS.models.leftBracketV19,
    LIB_DIR,
  ) as unknown as LeftGantryCornerBracketFull;
  const rightBracketV19 = useGLTF(
    ASSETS.models.rightBracketV19,
    LIB_DIR,
  ) as unknown as RightGantryCornerBracketFull;
  const beltClip = useGLTF(
    ASSETS.models.beltClip,
    LIB_DIR,
  ) as unknown as BeltClip;
  const yIdler = useGLTF(
    ASSETS.models.mountedIdlerPulleyGantry,
    LIB_DIR,
  ) as unknown as MountedIdlerPulleyFull;

  return <Group name={"gantry-assembly"}>
    {[0 - EXTRUSION_WIDTH, bedWidthOuter].map((outerY, index) =>
      <GantrySide key={outerY}
        aluminumTexture={aluminumTexture}
        columnShape={props.columnShape}
        config={config}
        index={index}
        leftBracket={leftBracket}
        leftBracketV19={leftBracketV19}
        outerY={outerY}
        rightBracket={rightBracket}
        rightBracketV19={rightBracketV19}
        version={version}
        WheelPlate={GantryWheelPlateComponent} />)}
    {config.cableCarriers && version.xCableCarrierMount &&
      <XAxisCCMountModel bedYOffset={config.bedYOffset} />}
    <GantryBeam
      config={config}
      configPosition={props.configPosition}
      aluminumTexture={aluminumTexture}
      beamShape={props.beamShape}
      local={true} />
    {version.number == "v1.9" && <MountedIdlerPulleyModel
      model={yIdler}
      name={"yIdlerPulley"}
      position={[-39, beamLength - 70, columnLength + 71]}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]} />}
    {config.cableCarriers && <CableCarrierSupportHorizontal
      config={config}
      configPosition={props.configPosition}
      local={true} />}
    {version.yMinimumStop && <Mesh name={"yStopMin"}
      position={[-29, -125, columnLength + 100]}
      rotation={[0, 0, Math.PI]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>}
    <Mesh name={"yStopMax"}
      position={[-29, botSizeY + 135, columnLength + 105]}
      rotation={[0, Math.PI, 0]}
      scale={1000}
      geometry={beltClip.nodes[PartName.beltClip].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <ElectronicsBox
      config={config}
      configPosition={props.configPosition}
      onSelectObject={props.onSelectObject}
      onHoverObject={props.onHoverObject}
      local={true} />
    <Solenoid
      config={config}
      configPosition={props.configPosition}
      frame={"gantry"}
      renderTubes={false} />
  </Group>;
};

const GANTRY_CONFIG_FIELDS: (keyof Config)[] = [
  "beamLength",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "botSizeY",
  "cableCarriers",
  "columnLength",
  "kitVersion",
  "light",
  "lightsDebug",
  "negativeZ",
  "tracks",
  "waterFlow",
  "zAxisLength",
  "zGantryOffset",
];

export const GantryAssembly = React.memo(
  GantryAssemblyBase,
  (prev, next) =>
    GANTRY_CONFIG_FIELDS.every(field =>
      prev.config[field] === next.config[field]) &&
    prev.version === next.version &&
    prev.columnShape === next.columnShape &&
    prev.beamShape === next.beamShape &&
    prev.onSelectObject === next.onSelectObject &&
    prev.onHoverObject === next.onHoverObject,
);
