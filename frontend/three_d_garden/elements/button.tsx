import React from "react";
import * as THREE from "three";
import { Box } from "@react-three/drei";
import { BufferGeometry } from "three";
import { Group, MeshPhongMaterial } from "../components";
import { Text } from "./text";

export interface PresetButtonProps {
  preset: string;
  choosePreset(preset: string): () => void;
  hovered: string;
  setHovered(preset: string): void;
  startPosition: Record<"x" | "y" | "z", number>;
  index: number;
}

const samePosition = (
  prev: PresetButtonProps["startPosition"],
  next: PresetButtonProps["startPosition"],
) =>
  prev.x === next.x &&
  prev.y === next.y &&
  prev.z === next.z;

export const presetButtonPropsEqual = (
  prev: PresetButtonProps,
  next: PresetButtonProps,
) =>
  prev.preset === next.preset &&
  prev.choosePreset === next.choosePreset &&
  prev.hovered === next.hovered &&
  prev.setHovered === next.setHovered &&
  prev.index === next.index &&
  samePosition(prev.startPosition, next.startPosition);

const PresetButtonBase = (props: PresetButtonProps) => {
  const { preset, choosePreset, hovered, setHovered, startPosition, index } = props;
  const btnHeight = 50;
  const btnZ = 0;
  const textZ = btnHeight / 2 + 1;
  return <Group name={"preset-button-wrapper"}
    position={[
      startPosition.x + index * 1100,
      startPosition.y,
      startPosition.z + btnHeight / 2,
    ]}
    onClick={() => {
      choosePreset(preset)();
    }}>
    <Group name={"preset-button"}
      onPointerDown={e =>
        changeItemsInGroup(e.object.parent as MeshObject, object => {
          if (object.name == "btn") {
            object.position.z = btnZ - 10;
          } else {
            object.position.z = textZ - 10;
          }
        })}
      onPointerOver={() => {
        setHovered(preset);
        document.body.style.cursor = "pointer";
      }}
      onPointerUp={e =>
        changeItemsInGroup(e.object.parent as MeshObject, object => {
          if (object.name == "btn") {
            object.position.z = btnZ;
          } else {
            object.position.z = textZ;
          }
        })}
      onPointerLeave={() => {
        document.body.style.cursor = "default";
        setHovered("");
      }}>
      <Box name={"btn"}
        args={[1000, 300, btnHeight]}
        position={[0, 0, 0]}>
        <MeshPhongMaterial color={hovered == preset ? "lightgray" : "gray"} />
      </Box>
      <Text
        fontSize={200}
        color={"black"}
        position={[0, 0, btnHeight / 2 + 1]}
        rotation={[0, 0, 0]}>
        {preset}
      </Text>
    </Group>
  </Group>;
};

export const PresetButton = React.memo(
  PresetButtonBase,
  presetButtonPropsEqual,
);

const changeItemsInGroup = (
  meshObject: MeshObject,
  cb: (x: MeshObject) => void,
) => {
  for (const child of meshObject.children) {
    const object = child as MeshObject;
    cb(object);
    changeItemsInGroup(object, cb);
  }
};

type MeshObject = THREE.Mesh<BufferGeometry, THREE.MeshStandardMaterial>;
