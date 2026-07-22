import React from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Cylinder, Extrude, Trail, useGLTF } from "@react-three/drei";
import { DoubleSide, RepeatWrapping, Shape } from "three";
import type { GLTF } from "three-stdlib";
import { Config, PositionConfig } from "../../config";
import {
  ASSETS, HOVER_OBJECT_MODES, LIB_DIR, PartName,
} from "../../constants";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { useTextureVariant } from "../../texture_variants";
import {
  MountedIdlerPulleyFull, MountedIdlerPulleyModel,
  VacuumPumpCoverFull, VacuumPumpCoverModel,
} from "../parts";
import { CableCarrierSupportVertical, Camera } from "../components";
import {
  ThreeDObjectHoverHandler, ThreeDObjectSelectionHandler,
} from "../../selection_types";
import { BotVersion } from "../bot_versions";
import { clickWasDragged } from "../../click_event";
import { indicatorColor } from
  "../../../controls/move/missed_step_indicator";
import { NativeJogEncoderData } from "../native_jog_controls";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode } from "../../../farm_designer/map/util";
import { EXTRUSION_WIDTH, UTM_RADIUS } from "./constants";
import { Highlight } from "../../elements";
import { t } from "../../../i18next_wrapper";

type ZStop = GLTF & {
  nodes: { [PartName.zStop]: THREE.Mesh };
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
type ZAxisMotorMount = GLTF & {
  nodes: { [PartName.zAxisMotorMount]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type CameraMountHalf = GLTF & {
  nodes: { [PartName.cameraMountHalf]: THREE.Mesh };
  materials: never;
}

export interface ZAxisAssemblyProps {
  config: Config;
  configPosition: PositionConfig;
  version: BotVersion;
  zAxisShape: Shape | undefined;
  trailReady: boolean;
  trailTarget: React.RefObject<THREE.Object3D>;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  encoderData?: NativeJogEncoderData;
}

const V17VacuumPumpCover = () => {
  const model = useGLTF(
    ASSETS.models.vacuumPumpCover,
    LIB_DIR,
  ) as unknown as VacuumPumpCoverFull;
  return <VacuumPumpCoverModel
    model={model}
    rotation={[0, 0, Math.PI / 2]}
    position={[1, 55, 490]} />;
};

export const maxMotorLoad = (encoderData: NativeJogEncoderData | undefined) =>
  Math.max(
    encoderData?.load?.x || 0,
    encoderData?.load?.y || 0,
    encoderData?.load?.z || 0,
  );

const LeadscrewDrive = (props: {
  zAxisLength: number;
}) => {
  const { zAxisLength } = props;
  const housingVertical = useGLTF(
    ASSETS.models.housingVertical,
    LIB_DIR,
  ) as unknown as HousingVertical;
  const zAxisMotorMount = useGLTF(
    ASSETS.models.zAxisMotorMount,
    LIB_DIR,
  ) as unknown as ZAxisMotorMount;
  return <Group name={"zMotor"}>
    <Mesh name={"zMotorHousing"}
      position={[-7, UTM_RADIUS - 46, zAxisLength - 80]}
      rotation={[0, 0, Math.PI]}
      scale={1000}
      geometry={housingVertical.nodes[PartName.housingVertical].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Mesh name={"zMotor"}
      position={[-1, UTM_RADIUS - 5, zAxisLength - 140]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={1000}
      geometry={undefined}
      material={undefined} />
    <Mesh name={"zMotorMount"}
      position={[-6, UTM_RADIUS - 65, zAxisLength - 80]}
      rotation={[0, 0, Math.PI]}
      scale={1000}
      geometry={zAxisMotorMount.nodes[PartName.zAxisMotorMount].geometry}>
      <MeshPhongMaterial color={"silver"} />
    </Mesh>
    <Cylinder name={"motorShaft"}
      args={[2.5, 2.5, 40]}
      position={[-6, UTM_RADIUS - 65, zAxisLength - 80]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"#999"} />
    </Cylinder>
    <Cylinder name={"shaftCoupler"}
      args={[10, 10, 25]}
      position={[-6, -30, zAxisLength - 120 + 25 / 2]}
      rotation={[Math.PI / 2, 0, 0]}>
      <MeshPhongMaterial color={"silver"} />
    </Cylinder>
    <Cylinder name={"leadscrew"}
      material-color={"#555"}
      args={[4, 4, zAxisLength - 200]}
      position={[-5, -30, zAxisLength / 2]}
      rotation={[Math.PI / 2, 0, 0]} />
  </Group>;
};

interface ZAxisCameraProps {
  onClick(event: ThreeEvent<MouseEvent>): void;
  onHoverObject?: ThreeDObjectHoverHandler;
  version: BotVersion;
  zGantryOffset: number;
}

const ZAxisCamera = (props: ZAxisCameraProps) => {
  const cameraMountHalf = useGLTF(
    ASSETS.models.cameraMountHalf,
    LIB_DIR,
  ) as unknown as CameraMountHalf;
  return <Highlight highlightName={"camera"}
    label={t("Camera")}
    labelPosition={[12, 35, props.zGantryOffset - 20]}>
    <Group name={"camera"}
      onClick={props.onClick}
      onPointerOver={() => props.onHoverObject?.(true)}
      onPointerOut={() => props.onHoverObject?.(false)}
      rotation={[Math.PI, 0, 0]}
      position={[12, 35, props.zGantryOffset - 120]}>
      <Group name={"cameraModel"} position={[0, -28, 1]}>
        <Camera kitVersion={props.version.number} />
      </Group>
      <Mesh name={"cameraMount"}
        position={[0, 0, -40]}
        scale={1000}
        geometry={cameraMountHalf.nodes[PartName.cameraMountHalf].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
      <Mesh name={"cameraMount"}
        rotation={[0, Math.PI, 0]}
        scale={1000}
        geometry={cameraMountHalf.nodes[PartName.cameraMountHalf].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>
    </Group>
  </Highlight>;
};

const ZAxisAssemblyBase = (props: ZAxisAssemblyProps) => {
  const { config, version } = props;
  const {
    botSizeZ, perspective, trail, zAxisLength, zGantryOffset,
  } = config;
  const motorLoad = maxMotorLoad(props.encoderData);
  const zStop = useGLTF(
    version.number == "v1.9"
      ? ASSETS.models.mountedIdlerPulley
      : ASSETS.models.zStop,
    LIB_DIR,
  );
  const utm = useGLTF(ASSETS.models.utm, LIB_DIR) as unknown as UTM;
  const aluminumTexture = useTextureVariant(ASSETS.textures.aluminum, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.01, 0.0003],
  });
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
  const zStopComponent = (
    name: string,
    position: [number, number, number],
    lower = false,
  ) =>
    version.number == "v1.9"
      ? <MountedIdlerPulleyModel
        model={zStop as unknown as MountedIdlerPulleyFull}
        name={name}
        position={[position[0], position[1], position[2] - 20]}
        rotation={[0, 0, -Math.PI / 2]}
        lower={lower} />
      : <Mesh name={name}
        position={position}
        rotation={[0, Math.PI / 2, 0]}
        scale={1000}
        geometry={(zStop as unknown as ZStop).nodes[PartName.zStop].geometry}>
        <MeshPhongMaterial color={"silver"} />
      </Mesh>;
  const utmComponent = <Highlight highlightName={"utm"}
    label={t("UTM")}
    labelPosition={[0, 0, 120]}>
    <Group name={"UTM"}
      rotation={[0, 0, Math.PI / 2]}>
      <Mesh
        geometry={utm.nodes.M5_Barb.geometry}
        material={utm.materials.PaletteMaterial001}
        position={[15, 9, 36]}
        scale={1000}
        onClick={selectUtm}
        onPointerOver={() => props.onHoverObject?.(true)}
        onPointerOut={() => props.onHoverObject?.(false)}
        rotation={[0, 0, 2.094]} />
    </Group>
  </Highlight>;

  return <Group name={"z-axis-assembly"}>
    <Extrude name={"z-axis"}
      castShadow={true}
      args={[
        props.zAxisShape,
        { steps: 1, depth: zAxisLength, bevelEnabled: false },
      ]}
      position={[-11, UTM_RADIUS, 0]}>
      <MeshPhongMaterial color={"white"}
        map={aluminumTexture}
        side={DoubleSide} />
    </Extrude>
    {version.leadscrewDrive && <LeadscrewDrive
      zAxisLength={zAxisLength} />}
    {config.cableCarriers && <CableCarrierSupportVertical
      config={config}
      configPosition={props.configPosition}
      local={true} />}
    {zStopComponent("zStopMax", [
      -16,
      UTM_RADIUS + EXTRUSION_WIDTH / 2,
      -30 + zGantryOffset,
    ], true)}
    {zStopComponent("zStopMin", [
      -16,
      UTM_RADIUS + EXTRUSION_WIDTH / 2,
      botSizeZ + 140 + zGantryOffset,
    ])}
    <Mesh name={"vacuumPump"}
      position={[17, 0, 40]}
      rotation={[0, 0, Math.PI / 2]}
      scale={1000}
      geometry={undefined}
      material={undefined} />
    {version.number == "v1.7" && <V17VacuumPumpCover />}
    {version.cameraFrame == "z-axis" && <ZAxisCamera
      onClick={selectCamera}
      onHoverObject={props.onHoverObject}
      version={version}
      zGantryOffset={zGantryOffset} />}
    {props.trailReady && trail
      ? <Trail
        target={props.trailTarget}
        width={perspective ? 500 : 0.1}
        attenuation={t => Math.pow(t, 3)}
        color={config.motorLoad ? indicatorColor(motorLoad) : "red"}
        length={100}
        decay={0.5}
        local={false}
        stride={0}
        interval={1}>
        {utmComponent}
      </Trail>
      : utmComponent}
  </Group>;
};

const Z_AXIS_CONFIG_FIELDS: (keyof Config)[] = [
  "botSizeZ",
  "cableCarriers",
  "columnLength",
  "kitVersion",
  "motorLoad",
  "negativeZ",
  "perspective",
  "trail",
  "zAxisLength",
  "zGantryOffset",
];

export const ZAxisAssembly = React.memo(
  ZAxisAssemblyBase,
  (prev, next) =>
    Z_AXIS_CONFIG_FIELDS.every(field =>
      prev.config[field] === next.config[field]) &&
    prev.version === next.version &&
    prev.zAxisShape === next.zAxisShape &&
    prev.trailReady === next.trailReady &&
    prev.trailTarget === next.trailTarget &&
    prev.encoderData === next.encoderData &&
    prev.onSelectObject === next.onSelectObject &&
    prev.onHoverObject === next.onHoverObject,
);
