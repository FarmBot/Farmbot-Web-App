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

const mesh0Keys = range(0, 26).map(i =>
  i === 0 ? "mesh0_mesh" : `mesh0_mesh_${i}`);
const mesh134Keys = range(0, 18).map(i =>
  i === 0 ? "mesh134_mesh" : `mesh134_mesh_${i}`);
const mesh152Keys = range(0, 17).map(i =>
  i === 0 ? "mesh152_mesh" : `mesh152_mesh_${i}`);
const mesh169Keys = range(0, 18).map(i =>
  i === 0 ? "mesh169_mesh" : `mesh169_mesh_${i}`);
const mesh187Keys = range(0, 16).map(i =>
  i === 0 ? "mesh187_mesh" : `mesh187_mesh_${i}`);
const mesh203Keys = range(0, 14).map(i =>
  i === 0 ? "mesh203_mesh" : `mesh203_mesh_${i}`);
const mesh217Keys = range(0, 6).map(i =>
  i === 0 ? "mesh217_mesh" : `mesh217_mesh_${i}`);

export type CrossSlideFull = GLTF & {
  nodes: {
    Cable_Carrier_Spacer_Block: THREE.Mesh;
    mesh0_mesh: Mesh;
    mesh0_mesh_1: Mesh;
    mesh0_mesh_2: Mesh;
    mesh0_mesh_3: Mesh;
    mesh0_mesh_4: Mesh;
    mesh0_mesh_5: Mesh;
    mesh0_mesh_6: Mesh;
    mesh0_mesh_7: Mesh;
    mesh0_mesh_8: Mesh;
    mesh0_mesh_9: Mesh;
    mesh0_mesh_10: Mesh;
    mesh0_mesh_11: Mesh;
    mesh0_mesh_12: Mesh;
    mesh0_mesh_13: Mesh;
    mesh0_mesh_14: Mesh;
    mesh0_mesh_15: Mesh;
    mesh0_mesh_16: Mesh;
    mesh0_mesh_17: Mesh;
    mesh0_mesh_18: Mesh;
    mesh0_mesh_19: Mesh;
    mesh0_mesh_20: Mesh;
    mesh0_mesh_21: Mesh;
    mesh0_mesh_22: Mesh;
    mesh0_mesh_23: Mesh;
    mesh0_mesh_24: Mesh;
    mesh0_mesh_25: Mesh;
    mesh134_mesh: Mesh;
    mesh134_mesh_1: Mesh;
    mesh134_mesh_2: Mesh;
    mesh134_mesh_3: Mesh;
    mesh134_mesh_4: Mesh;
    mesh134_mesh_5: Mesh;
    mesh134_mesh_6: Mesh;
    mesh134_mesh_7: Mesh;
    mesh134_mesh_8: Mesh;
    mesh134_mesh_9: Mesh;
    mesh134_mesh_10: Mesh;
    mesh134_mesh_11: Mesh;
    mesh134_mesh_12: Mesh;
    mesh134_mesh_13: Mesh;
    mesh134_mesh_14: Mesh;
    mesh134_mesh_15: Mesh;
    mesh134_mesh_16: Mesh;
    mesh134_mesh_17: Mesh;
    mesh152_mesh: Mesh;
    mesh152_mesh_1: Mesh;
    mesh152_mesh_2: Mesh;
    mesh152_mesh_3: Mesh;
    mesh152_mesh_4: Mesh;
    mesh152_mesh_5: Mesh;
    mesh152_mesh_6: Mesh;
    mesh152_mesh_7: Mesh;
    mesh152_mesh_8: Mesh;
    mesh152_mesh_9: Mesh;
    mesh152_mesh_10: Mesh;
    mesh152_mesh_11: Mesh;
    mesh152_mesh_12: Mesh;
    mesh152_mesh_13: Mesh;
    mesh152_mesh_14: Mesh;
    mesh152_mesh_15: Mesh;
    mesh152_mesh_16: Mesh;
    mesh169_mesh: Mesh;
    mesh169_mesh_1: Mesh;
    mesh169_mesh_2: Mesh;
    mesh169_mesh_3: Mesh;
    mesh169_mesh_4: Mesh;
    mesh169_mesh_5: Mesh;
    mesh169_mesh_6: Mesh;
    mesh169_mesh_7: Mesh;
    mesh169_mesh_8: Mesh;
    mesh169_mesh_9: Mesh;
    mesh169_mesh_10: Mesh;
    mesh169_mesh_11: Mesh;
    mesh169_mesh_12: Mesh;
    mesh169_mesh_13: Mesh;
    mesh169_mesh_14: Mesh;
    mesh169_mesh_15: Mesh;
    mesh169_mesh_16: Mesh;
    mesh169_mesh_17: Mesh;
    mesh187_mesh: Mesh;
    mesh187_mesh_1: Mesh;
    mesh187_mesh_2: Mesh;
    mesh187_mesh_3: Mesh;
    mesh187_mesh_4: Mesh;
    mesh187_mesh_5: Mesh;
    mesh187_mesh_6: Mesh;
    mesh187_mesh_7: Mesh;
    mesh187_mesh_8: Mesh;
    mesh187_mesh_9: Mesh;
    mesh187_mesh_10: Mesh;
    mesh187_mesh_11: Mesh;
    mesh187_mesh_12: Mesh;
    mesh187_mesh_13: Mesh;
    mesh187_mesh_14: Mesh;
    mesh187_mesh_15: Mesh;
    mesh203_mesh: Mesh;
    mesh203_mesh_1: Mesh;
    mesh203_mesh_2: Mesh;
    mesh203_mesh_3: Mesh;
    mesh203_mesh_4: Mesh;
    mesh203_mesh_5: Mesh;
    mesh203_mesh_6: Mesh;
    mesh203_mesh_7: Mesh;
    mesh203_mesh_8: Mesh;
    mesh203_mesh_9: Mesh;
    mesh203_mesh_10: Mesh;
    mesh203_mesh_11: Mesh;
    mesh203_mesh_12: Mesh;
    mesh203_mesh_13: Mesh;
    mesh217_mesh: Mesh;
    mesh217_mesh_1: Mesh;
    mesh217_mesh_2: Mesh;
    mesh217_mesh_3: Mesh;
    mesh217_mesh_4: Mesh;
    mesh217_mesh_5: Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

export const CrossSlide = (model: CrossSlideFull) =>
  React.memo((props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    const nodeMap = nodes as Record<string, Mesh>;
    const spacerPosition = React.useMemo<[number, number, number]>(
      () => [0.03, 0.005, 0.061], []);
    const spacerRotation = React.useMemo<[number, number, number]>(
      () => [-Math.PI / 2, 0, Math.PI], []);
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
        ...renderGroup(mesh0Keys, 5),
        ...renderGroup(mesh134Keys, 20),
        ...renderGroup(mesh152Keys, 16),
        ...renderGroup(mesh169Keys, 12),
        ...renderGroup(mesh187Keys, 10),
        ...renderGroup(mesh203Keys, 10),
        ...renderGroup(mesh217Keys, 5),
      ];
    }, [material, nodeMap]);
    return <Group {...props}>
      <MeshComponent
        geometry={nodes.Cable_Carrier_Spacer_Block.geometry}
        material={material}
        position={spacerPosition}
        rotation={spacerRotation} />
      {instancedMeshes}
    </Group>;
  });
