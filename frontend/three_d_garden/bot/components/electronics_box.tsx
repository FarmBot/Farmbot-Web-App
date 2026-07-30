import React from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Config, PositionConfig } from "../../config";
import type { GLTF } from "three-stdlib";
import {
  ASSETS, ElectronicsBoxMaterial, HOVER_OBJECT_MODES, LIB_DIR, PartName,
} from "../../constants";
import {
  Group, InstancedMesh, Mesh, MeshBasicMaterial,
} from "../../components";
import {
  ThreeDObjectHoverHandler, ThreeDObjectSelectionHandler,
} from "../../selection_types";
import { clickWasDragged } from "../../click_event";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode } from "../../../farm_designer/map/util";
import { getBotKinematics } from "../kinematics";
import { getBotVersion } from "../bot_versions";
import { frontSideMaterial } from "../../geometry_batching";
import { Highlight } from "../../elements";

type Box = GLTF & {
  nodes: {
    Electronics_Box: THREE.Mesh;
    Electronics_Box_Gasket: THREE.Mesh;
    Electronics_Box_Lid: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.box]: THREE.MeshStandardMaterial;
    [ElectronicsBoxMaterial.gasket]: THREE.MeshStandardMaterial;
    [ElectronicsBoxMaterial.lid]: THREE.MeshStandardMaterial;
  };
}
type Btn = GLTF & {
  nodes: {
    ["Push_Button_-_Red"]: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.button]: THREE.MeshStandardMaterial;
  };
}
type Led = GLTF & {
  nodes: {
    LED: THREE.Mesh;
  };
  materials: {
    [ElectronicsBoxMaterial.led]: THREE.MeshStandardMaterial;
  };
}
type Pi = GLTF & {
  nodes: { [PartName.pi]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}
type Farmduino = GLTF & {
  nodes: { [PartName.farmduino]: THREE.Mesh };
  materials: { PaletteMaterial001: THREE.MeshStandardMaterial };
}

const BoxButtonColor = {
  estop: 0xef4037,
  unlock: 0xf5e909,
  connect: 0x1073e0,
  sync: 0x62c020,
  blank: 0xffffff,
};

const buttons = (kitVersion: string) =>
  getBotVersion(kitVersion).electronicsButtonCount == 5
    ? [
      { position: -60, color: BoxButtonColor.estop },
      { position: -30, color: BoxButtonColor.unlock },
      { position: 0, color: BoxButtonColor.blank },
      { position: 30, color: BoxButtonColor.blank },
      { position: 60, color: BoxButtonColor.blank },
    ]
    : [
      { position: -30, color: BoxButtonColor.estop },
      { position: 0, color: BoxButtonColor.unlock },
      { position: 30, color: BoxButtonColor.blank },
    ];

const ledsPresent = (kitVersion: string) =>
  getBotVersion(kitVersion).electronicsLeds;

const LED_INDICATORS = [
  { position: -45, color: BoxButtonColor.sync },
  { position: -15, color: BoxButtonColor.connect },
  { position: 15, color: BoxButtonColor.blank },
  { position: 45, color: BoxButtonColor.blank },
];

interface HardwareInstance {
  color: THREE.ColorRepresentation;
  position: number;
}

export const makeHardwareInstanceAttributes = (
  instances: HardwareInstance[],
  x: number,
  scale: number,
  rotation: [number, number, number] = [0, 0, 0],
) => {
  const matrices = new Float32Array(instances.length * 16);
  const colors = new Float32Array(instances.length * 3);
  const quaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(...rotation),
  );
  const scaleVector = new THREE.Vector3(scale, scale, scale);
  instances.forEach((instance, index) => {
    new THREE.Matrix4().compose(
      new THREE.Vector3(x, instance.position, 0),
      quaternion,
      scaleVector,
    ).toArray(matrices, index * 16);
    new THREE.Color(instance.color).toArray(colors, index * 3);
  });
  return {
    instanceColor: new THREE.InstancedBufferAttribute(colors, 3),
    instanceMatrix: new THREE.InstancedBufferAttribute(matrices, 16),
  };
};

const LedIndicators = () => {
  const led = useGLTF(ASSETS.models.led, LIB_DIR) as unknown as Led;
  const housingAttributes = React.useMemo(() =>
    makeHardwareInstanceAttributes(LED_INDICATORS, -50, 1000), []);
  const lightAttributes = React.useMemo(() =>
    makeHardwareInstanceAttributes(
      LED_INDICATORS, -50, 1, [Math.PI / 2, 0, 0],
    ), []);
  return <Group name={"leds"} position={[0, 0, 130]}>
    <InstancedMesh name={"led-housings"}
      args={[
        led.nodes.LED.geometry,
        frontSideMaterial(led.materials[ElectronicsBoxMaterial.led]),
        LED_INDICATORS.length,
      ]}
      instanceMatrix={housingAttributes.instanceMatrix}
      material-color={0xcccccc} />
    <InstancedMesh name={"led-colors"}
      args={[undefined, undefined, LED_INDICATORS.length]}
      instanceColor={lightAttributes.instanceColor}
      instanceMatrix={lightAttributes.instanceMatrix}>
      <cylinderGeometry args={[6.75, 6.75, 3]} />
      <MeshBasicMaterial color={"white"} vertexColors={true} />
    </InstancedMesh>
  </Group>;
};

const ButtonInstances = (props: {
  btn: Btn;
  kitVersion: string;
}) => {
  const buttonInstances = React.useMemo(
    () => buttons(props.kitVersion),
    [props.kitVersion],
  );
  const housingAttributes = React.useMemo(() =>
    makeHardwareInstanceAttributes(buttonInstances, -30, 1000), [buttonInstances]);
  const buttonAttributes = React.useMemo(() =>
    makeHardwareInstanceAttributes(
      buttonInstances, -30, 1, [Math.PI / 2, 0, 0],
    ), [buttonInstances]);
  return <Group name={"buttons"} position={[0, 0, 130]}>
    <InstancedMesh name={"button-housings"}
      args={[
        props.btn.nodes["Push_Button_-_Red"].geometry,
        frontSideMaterial(
          props.btn.materials[ElectronicsBoxMaterial.button],
        ),
        buttonInstances.length,
      ]}
      instanceMatrix={housingAttributes.instanceMatrix}
      material-color={0xcccccc} />
    <InstancedMesh name={"button-colors"}
      args={[undefined, undefined, buttonInstances.length]}
      instanceColor={buttonAttributes.instanceColor}
      instanceMatrix={buttonAttributes.instanceMatrix}>
      <cylinderGeometry args={[9, 0, 3.5]} />
      <MeshBasicMaterial color={"white"} vertexColors={true} />
    </InstancedMesh>
    <InstancedMesh name={"button-centers"}
      args={[undefined, undefined, buttonInstances.length]}
      instanceMatrix={buttonAttributes.instanceMatrix}>
      <cylinderGeometry args={[6.75, 0, 4]} />
      <MeshBasicMaterial color={0xcccccc} />
    </InstancedMesh>
  </Group>;
};

export interface ElectronicsBoxProps {
  config: Config;
  configPosition: PositionConfig;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
  local?: boolean;
}

export const getElectronicsBoxPosition = (
  config: Config,
  configPosition: PositionConfig,
) => new THREE.Vector3(
  ...getBotKinematics(config, configPosition)
    .anchors.electronics.worldPosition,
);

const electronicsBoxPropsEqual = (
  prevProps: ElectronicsBoxProps,
  nextProps: ElectronicsBoxProps,
) =>
  prevProps.configPosition.x == nextProps.configPosition.x &&
  prevProps.local == nextProps.local &&
  prevProps.config.bedXOffset == nextProps.config.bedXOffset &&
  prevProps.config.bedYOffset == nextProps.config.bedYOffset &&
  prevProps.config.bedLengthOuter == nextProps.config.bedLengthOuter &&
  prevProps.config.bedWidthOuter == nextProps.config.bedWidthOuter &&
  prevProps.config.columnLength == nextProps.config.columnLength &&
  prevProps.config.kitVersion == nextProps.config.kitVersion &&
  prevProps.onSelectObject == nextProps.onSelectObject &&
  prevProps.onHoverObject == nextProps.onHoverObject;

const ElectronicsBoxBase = (props: ElectronicsBoxProps) => {
  const {
    config, configPosition, onHoverObject, onSelectObject,
  } = props;
  const selectElectronics = React.useCallback((event: ThreeEvent<MouseEvent>) => {
    if (clickWasDragged(event)) { return; }
    if ([...HOVER_OBJECT_MODES, Mode.cameraSelection].includes(getMode())) {
      return;
    }
    if (onSelectObject) {
      onSelectObject({ kind: "electronics", id: 0 }) !== false &&
        event.stopPropagation?.();
    }
  }, [onSelectObject]);
  const hoverElectronics = React.useCallback((
    hovered: boolean,
    event: ThreeEvent<PointerEvent>,
  ) => {
    event.stopPropagation?.();
    onHoverObject?.(hovered);
  }, [onHoverObject]);
  const onPointerOver = React.useCallback((event: ThreeEvent<PointerEvent>) =>
    hoverElectronics(true, event), [hoverElectronics]);
  const onPointerOut = React.useCallback((event: ThreeEvent<PointerEvent>) =>
    hoverElectronics(false, event), [hoverElectronics]);
  const position = props.local
    ? getBotKinematics(config, configPosition).anchors.electronics.localPosition
    : getElectronicsBoxPosition(config, configPosition);
  return <Group name={"electronics-box"} position={position}>
    <Highlight highlightName={"electronics"}>
      <ElectronicsBoxModel
        kitVersion={config.kitVersion}
        onClick={selectElectronics}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut} />
    </Highlight>
  </Group>;
};

export const ElectronicsBox = React.memo(
  ElectronicsBoxBase, electronicsBoxPropsEqual);

interface ElectronicsBoxModelProps {
  kitVersion: string;
  onClick(event: ThreeEvent<MouseEvent>): void;
  onPointerOver(event: ThreeEvent<PointerEvent>): void;
  onPointerOut(event: ThreeEvent<PointerEvent>): void;
}

const ElectronicsBoxModelBase = (props: ElectronicsBoxModelProps) => {
  const box = useGLTF(ASSETS.models.box, LIB_DIR) as unknown as Box;
  const btn = useGLTF(ASSETS.models.btn, LIB_DIR) as unknown as Btn;
  const pi = useGLTF(ASSETS.models.pi, LIB_DIR) as unknown as Pi;
  const farmduino =
    useGLTF(ASSETS.models.farmduino, LIB_DIR) as unknown as Farmduino;
  return <>
    <Group name={"box"}
      onClick={props.onClick}
      onPointerOver={props.onPointerOver}
      onPointerOut={props.onPointerOut}
      rotation={[0, 0, Math.PI / 2]}>
      <Mesh name={"electronicsBox"}
        geometry={box.nodes.Electronics_Box.geometry}
        material={box.materials[ElectronicsBoxMaterial.box]}
        scale={1000}
        castShadow={true}
        material-color={0xffffff}
        material-emissive={0x999999} />
      <Mesh name={"electronicsBoxGasket"}
        geometry={box.nodes.Electronics_Box_Gasket.geometry}
        material={box.materials[ElectronicsBoxMaterial.gasket]}
        scale={1000} />
      <Mesh name={"electronicsBoxLid"}
        geometry={box.nodes.Electronics_Box_Lid.geometry}
        material={box.materials[ElectronicsBoxMaterial.lid]}
        scale={1000} />
      <ButtonInstances btn={btn} kitVersion={props.kitVersion} />
      {ledsPresent(props.kitVersion) && <LedIndicators />}
    </Group>
    <Mesh name={"farmduino"}
      position={[-60, -10, -110]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={1000}
      geometry={farmduino.nodes[PartName.farmduino].geometry}
      material={frontSideMaterial(
        farmduino.materials.PaletteMaterial001,
      )} />
    <Mesh name={"pi"}
      position={[-15, -10, 40]}
      rotation={[Math.PI / 2, 0, Math.PI]}
      scale={1000}
      geometry={pi.nodes[PartName.pi].geometry}
      material={frontSideMaterial(pi.materials.PaletteMaterial001)} />
  </>;
};

const ElectronicsBoxModel = React.memo(ElectronicsBoxModelBase);
