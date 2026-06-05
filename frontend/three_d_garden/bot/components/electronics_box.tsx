import React from "react";
import * as THREE from "three";
import { ThreeEvent } from "@react-three/fiber";
import { Cylinder, useGLTF } from "@react-three/drei";
import { Config, PositionConfig } from "../../config";
import type { GLTF } from "three-stdlib";
import {
  ASSETS, ElectronicsBoxMaterial, HOVER_OBJECT_MODES, LIB_DIR, PartName,
} from "../../constants";
import { Group, Mesh } from "../../components";
import {
  ThreeDObjectHoverHandler, ThreeDObjectSelectionHandler,
} from "../../selection_types";
import { clickWasDragged } from "../../click_event";
import { Mode } from "../../../farm_designer/map/interfaces";
import { getMode } from "../../../farm_designer/map/util";
import { getElectronicsBoxPosition } from "../positioning";

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

const buttons = (kitVersion: string) => {
  switch (kitVersion) {
    case "v1.7":
      return [
        { position: -60, color: BoxButtonColor.estop },
        { position: -30, color: BoxButtonColor.unlock },
        { position: 0, color: BoxButtonColor.blank },
        { position: 30, color: BoxButtonColor.blank },
        { position: 60, color: BoxButtonColor.blank },
      ];
    case "v1.8":
    default:
      return [
        { position: -30, color: BoxButtonColor.estop },
        { position: 0, color: BoxButtonColor.unlock },
        { position: 30, color: BoxButtonColor.blank },
      ];
  }
};

const ledsPresent = (kitVersion: string) => {
  switch (kitVersion) {
    case "v1.7":
      return true;
    case "v1.8":
    default:
      return false;
  }
};

const LED_INDICATORS = [
  { position: -45, color: BoxButtonColor.sync },
  { position: -15, color: BoxButtonColor.connect },
  { position: 15, color: BoxButtonColor.blank },
  { position: 45, color: BoxButtonColor.blank },
];

const LedIndicators = () => {
  const led = useGLTF(ASSETS.models.led, LIB_DIR) as unknown as Led;
  return <Group name={"leds"} position={[0, 0, 130]}>
    {LED_INDICATORS.map(ledIndicator => {
      const { position, color } = ledIndicator;
      return <Group key={position}>
        <Mesh name={"led-housing"}
          geometry={led.nodes.LED.geometry}
          material={led.materials[ElectronicsBoxMaterial.led]}
          position={[-50, position, 0]}
          material-color={0xcccccc}
          scale={1000} />
        <Cylinder name={"led-color"}
          material-color={color}
          args={[6.75, 6.75, 3]}
          position={[-50, position, 0]}
          rotation={[Math.PI / 2, 0, 0]} />
      </Group>;
    })}
  </Group>;
};

export interface ElectronicsBoxProps {
  config: Config;
  configPosition: PositionConfig;
  onSelectObject?: ThreeDObjectSelectionHandler;
  onHoverObject?: ThreeDObjectHoverHandler;
}

const electronicsBoxPropsEqual = (
  prevProps: ElectronicsBoxProps,
  nextProps: ElectronicsBoxProps,
) =>
  prevProps.configPosition.x == nextProps.configPosition.x &&
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
  return <Group name={"electronics-box"}
    position={getElectronicsBoxPosition(config, configPosition)}>
    <ElectronicsBoxModel
      kitVersion={config.kitVersion}
      onClick={selectElectronics}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut} />
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
      <Group name={"buttons"}
        position={[0, 0, 130]}>
        {buttons(props.kitVersion).map(button => {
          const { position, color } = button;
          const btnPosition = position;
          return <Group key={btnPosition} name={"button-group"}>
            <Mesh name={"button-housing"}
              geometry={btn.nodes["Push_Button_-_Red"].geometry}
              material={btn.materials[ElectronicsBoxMaterial.button]}
              position={[-30, btnPosition, 0]}
              scale={1000}
              material-color={0xcccccc} />
            <Cylinder
              name={"button-color"}
              material-color={color}
              args={[9, 0, 3.5]}
              position={[-30, btnPosition, 0]}
              rotation={[Math.PI / 2, 0, 0]} />
            <Cylinder name={"button-center"}
              material-color={0xcccccc}
              args={[6.75, 0, 4]}
              position={[-30, btnPosition, 0]}
              rotation={[Math.PI / 2, 0, 0]} />
          </Group>;
        })}
      </Group>
      {ledsPresent(props.kitVersion) && <LedIndicators />}
    </Group>
    <Mesh name={"farmduino"}
      position={[-60, -10, -110]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={1000}
      geometry={farmduino.nodes[PartName.farmduino].geometry}
      material={farmduino.materials.PaletteMaterial001} />
    <Mesh name={"pi"}
      position={[-15, -10, 40]}
      rotation={[Math.PI / 2, 0, Math.PI]}
      scale={1000}
      geometry={pi.nodes[PartName.pi].geometry}
      material={pi.materials.PaletteMaterial001} />
  </>;
};

const ElectronicsBoxModel = React.memo(ElectronicsBoxModelBase);
