/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { InstancedBufferAttribute } from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent, InstancedMesh } from "../../components";
import { ThreeElements } from "@react-three/fiber";
import { range } from "lodash";

type Mesh = THREE.Mesh & { instanceMatrix: InstancedBufferAttribute | undefined };

const mesh0Keys = range(0, 26).map(i =>
  i === 0 ? "mesh0_mesh" : `mesh0_mesh_${i}`);
const mesh584Keys = range(0, 18).map(i =>
  i === 0 ? "mesh584_mesh" : `mesh584_mesh_${i}`);

export type SoilSensorFull = GLTF & {
  nodes: {
    Soil_Sensor: Mesh;
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
    mesh584_mesh: Mesh;
    mesh584_mesh_1: Mesh;
    mesh584_mesh_2: Mesh;
    mesh584_mesh_3: Mesh;
    mesh584_mesh_4: Mesh;
    mesh584_mesh_5: Mesh;
    mesh584_mesh_6: Mesh;
    mesh584_mesh_7: Mesh;
    mesh584_mesh_8: Mesh;
    mesh584_mesh_9: Mesh;
    mesh584_mesh_10: Mesh;
    mesh584_mesh_11: Mesh;
    mesh584_mesh_12: Mesh;
    mesh584_mesh_13: Mesh;
    mesh584_mesh_14: Mesh;
    mesh584_mesh_15: Mesh;
    mesh584_mesh_16: Mesh;
    mesh584_mesh_17: Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

export const SoilSensor = (model: SoilSensorFull) =>
  React.memo((props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    const nodeMap = nodes as Record<string, Mesh>;
    const sensorPosition = React.useMemo<[number, number, number]>(
      () => [0, 0, -0.015], []);
    const material = materials.PaletteMaterial001;
    const instancedMeshes = React.useMemo(() => {
      const renderGroup = (keys: string[]) =>
        keys.map(key => {
          const node = nodeMap[key];
          return <InstancedMesh key={key}
            args={[node.geometry, material, 8]}
            instanceMatrix={node.instanceMatrix} />;
        });
      return [
        ...renderGroup(mesh0Keys),
        ...renderGroup(mesh584Keys),
      ];
    }, [material, nodeMap]);
    return <Group {...props} dispose={null}>
      <MeshComponent
        geometry={nodes.Soil_Sensor.geometry}
        material={material}
        position={sensorPosition} />
      {instancedMeshes}
    </Group>;
  });
