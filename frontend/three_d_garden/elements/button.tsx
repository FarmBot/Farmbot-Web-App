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

export const PresetButton = (props: PresetButtonProps) => {
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

const changeItemsInGroup = (
  meshObject: MeshObject,
  cb: (x: MeshObject) => void,
) => {
  meshObject.children.map(child => {
    const object = child as MeshObject;
    cb(object);
    changeItemsInGroup(object, cb);
  });
};

type MeshObject = THREE.Mesh<BufferGeometry, THREE.MeshStandardMaterial>;
