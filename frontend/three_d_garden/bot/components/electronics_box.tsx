import React from "react";
import * as THREE from "three";
import { Cylinder, useGLTF } from "@react-three/drei";
import { threeSpace } from "../../helpers";
import { Config } from "../../config";
import { GLTF } from "three-stdlib";
import { ASSETS, ElectronicsBoxMaterial, LIB_DIR, PartName } from "../../constants";
import { Group, Mesh } from "../../components";
import { IColor } from "../../../settings/pin_bindings/model";

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

const buttons = (kitVersion: string) => {
  switch (kitVersion) {
    case "v1.7":
      return [
        { position: -60, color: IColor.estop.on },
        { position: -30, color: IColor.unlock.on },
        { position: 0, color: IColor.blank.on },
        { position: 30, color: IColor.blank.on },
        { position: 60, color: IColor.blank.on },
      ];
    case "v1.8":
    default:
      return [
        { position: -30, color: IColor.estop.on },
        { position: 0, color: IColor.unlock.on },
        { position: 30, color: IColor.blank.on },
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

export interface ElectronicsBoxProps {
  config: Config;
}

export const ElectronicsBox = (props: ElectronicsBoxProps) => {
  const { x, bedXOffset, bedLengthOuter, bedWidthOuter, columnLength } = props.config;

  const box = useGLTF(ASSETS.models.box, LIB_DIR) as Box;
  const btn = useGLTF(ASSETS.models.btn, LIB_DIR) as Btn;
  const led = useGLTF(ASSETS.models.led, LIB_DIR) as Led;
  const pi = useGLTF(ASSETS.models.pi, LIB_DIR) as Pi;
  const farmduino = useGLTF(ASSETS.models.farmduino, LIB_DIR) as Farmduino;

  return <Group name={"electronics-box"}
    position={new THREE.Vector3(
      threeSpace(x - 62, bedLengthOuter) + bedXOffset,
      threeSpace(-20, bedWidthOuter),
      columnLength - 190,
    )}>
    <Group name={"box"}
      rotation={[0, 0, Math.PI / 2]}>
      <Mesh name={"electronicsBox"}
        geometry={box.nodes.Electronics_Box.geometry}
        material={box.materials[ElectronicsBoxMaterial.box]}
        scale={1000}
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
        {buttons(props.config.kitVersion).map(button => {
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
      <Group name={"leds"}
        position={[0, 0, 130]}
        visible={ledsPresent(props.config.kitVersion)}>
        {[
          { position: -45, color: IColor.sync.on },
          { position: -15, color: IColor.connect.on },
          { position: 15, color: IColor.blank.on },
          { position: 45, color: IColor.blank.on },
        ].map(ledIndicator => {
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
      </Group>
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
  </Group>;
};
