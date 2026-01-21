/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { InstancedBufferAttribute } from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent, InstancedMesh } from "../../components";
import { ThreeElements } from "@react-three/fiber";
import { range } from "lodash";

type Mesh = THREE.Mesh & {
  instanceMatrix?: InstancedBufferAttribute | undefined;
};

const mesh141Keys = range(0, 18).map(i =>
  i === 0 ? "mesh141_mesh" : `mesh141_mesh_${i}`);
const mesh159Keys = range(0, 17).map(i =>
  i === 0 ? "mesh159_mesh" : `mesh159_mesh_${i}`);
const mesh176Keys = range(0, 16).map(i =>
  i === 0 ? "mesh176_mesh" : `mesh176_mesh_${i}`);
const mesh192Keys = range(0, 14).map(i =>
  i === 0 ? "mesh192_mesh" : `mesh192_mesh_${i}`);
const mesh206Keys = range(0, 18).map(i =>
  i === 0 ? "mesh206_mesh" : `mesh206_mesh_${i}`);

export type GantryWheelPlateFull = GLTF & {
  nodes: {
    Gantry_Wheel_Plate: THREE.Mesh;
    mesh141_mesh: Mesh;
    mesh141_mesh_1: Mesh;
    mesh141_mesh_2: Mesh;
    mesh141_mesh_3: Mesh;
    mesh141_mesh_4: Mesh;
    mesh141_mesh_5: Mesh;
    mesh141_mesh_6: Mesh;
    mesh141_mesh_7: Mesh;
    mesh141_mesh_8: Mesh;
    mesh141_mesh_9: Mesh;
    mesh141_mesh_10: Mesh;
    mesh141_mesh_11: Mesh;
    mesh141_mesh_12: Mesh;
    mesh141_mesh_13: Mesh;
    mesh141_mesh_14: Mesh;
    mesh141_mesh_15: Mesh;
    mesh141_mesh_16: Mesh;
    mesh141_mesh_17: Mesh;
    mesh159_mesh: Mesh;
    mesh159_mesh_1: Mesh;
    mesh159_mesh_2: Mesh;
    mesh159_mesh_3: Mesh;
    mesh159_mesh_4: Mesh;
    mesh159_mesh_5: Mesh;
    mesh159_mesh_6: Mesh;
    mesh159_mesh_7: Mesh;
    mesh159_mesh_8: Mesh;
    mesh159_mesh_9: Mesh;
    mesh159_mesh_10: Mesh;
    mesh159_mesh_11: Mesh;
    mesh159_mesh_12: Mesh;
    mesh159_mesh_13: Mesh;
    mesh159_mesh_14: Mesh;
    mesh159_mesh_15: Mesh;
    mesh159_mesh_16: Mesh;
    mesh176_mesh: Mesh;
    mesh176_mesh_1: Mesh;
    mesh176_mesh_2: Mesh;
    mesh176_mesh_3: Mesh;
    mesh176_mesh_4: Mesh;
    mesh176_mesh_5: Mesh;
    mesh176_mesh_6: Mesh;
    mesh176_mesh_7: Mesh;
    mesh176_mesh_8: Mesh;
    mesh176_mesh_9: Mesh;
    mesh176_mesh_10: Mesh;
    mesh176_mesh_11: Mesh;
    mesh176_mesh_12: Mesh;
    mesh176_mesh_13: Mesh;
    mesh176_mesh_14: Mesh;
    mesh176_mesh_15: Mesh;
    mesh192_mesh: Mesh;
    mesh192_mesh_1: Mesh;
    mesh192_mesh_2: Mesh;
    mesh192_mesh_3: Mesh;
    mesh192_mesh_4: Mesh;
    mesh192_mesh_5: Mesh;
    mesh192_mesh_6: Mesh;
    mesh192_mesh_7: Mesh;
    mesh192_mesh_8: Mesh;
    mesh192_mesh_9: Mesh;
    mesh192_mesh_10: Mesh;
    mesh192_mesh_11: Mesh;
    mesh192_mesh_12: Mesh;
    mesh192_mesh_13: Mesh;
    mesh206_mesh: Mesh;
    mesh206_mesh_1: Mesh;
    mesh206_mesh_2: Mesh;
    mesh206_mesh_3: Mesh;
    mesh206_mesh_4: Mesh;
    mesh206_mesh_5: Mesh;
    mesh206_mesh_6: Mesh;
    mesh206_mesh_7: Mesh;
    mesh206_mesh_8: Mesh;
    mesh206_mesh_9: Mesh;
    mesh206_mesh_10: Mesh;
    mesh206_mesh_11: Mesh;
    mesh206_mesh_12: Mesh;
    mesh206_mesh_13: Mesh;
    mesh206_mesh_14: Mesh;
    mesh206_mesh_15: Mesh;
    mesh206_mesh_16: Mesh;
    mesh206_mesh_17: Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

export const GantryWheelPlate = (model: GantryWheelPlateFull) =>
  React.memo((props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    const nodeMap = nodes as Record<string, Mesh>;
    const platePosition = React.useMemo<[number, number, number]>(
      () => [0.002, 0.05, 0], []);
    const plateRotation = React.useMemo<[number, number, number]>(
      () => [Math.PI / 2, -Math.PI / 2, 0], []);
    const material = materials.PaletteMaterial001;
    const instancedMeshes = React.useMemo(() => {
      const renderGroup = (keys: string[], count: number) =>
        keys.map(key => {
          const node = nodeMap[key];
          return <InstancedMesh key={key}
            args={[node.geometry, material, count]}
            instanceMatrix={node.instanceMatrix} />;
        });
      return [
        ...renderGroup(mesh141Keys, 5),
        ...renderGroup(mesh159Keys, 5),
        ...renderGroup(mesh176Keys, 5),
        ...renderGroup(mesh192Keys, 5),
        ...renderGroup(mesh206Keys, 10),
      ];
    }, [material, nodeMap]);
    return <Group {...props}>
      <MeshComponent
        geometry={nodes.Gantry_Wheel_Plate.geometry}
        material={material}
        position={platePosition}
        rotation={plateRotation} />
      {instancedMeshes}
    </Group>;
  });
