/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { InstancedBufferAttribute } from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent, InstancedMesh } from "../../components";
import { ThreeElements } from "@react-three/fiber";

type Mesh = THREE.Mesh & { instanceMatrix: InstancedBufferAttribute | undefined };

export type RotaryToolFull = GLTF & {
  nodes: {
    M25_x_6mm_Screw: THREE.Mesh;
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
    mesh476_mesh: Mesh;
    mesh476_mesh_1: Mesh;
    mesh476_mesh_2: Mesh;
    mesh476_mesh_3: Mesh;
    mesh476_mesh_4: Mesh;
    mesh476_mesh_5: Mesh;
    mesh476_mesh_6: Mesh;
    mesh476_mesh_7: Mesh;
    mesh476_mesh_8: Mesh;
    mesh476_mesh_9: Mesh;
    mesh476_mesh_10: Mesh;
    mesh476_mesh_11: Mesh;
    mesh476_mesh_12: Mesh;
    mesh476_mesh_13: Mesh;
    mesh476_mesh_14: Mesh;
    mesh476_mesh_15: Mesh;
    mesh476_mesh_16: Mesh;
    mesh476_mesh_17: Mesh;
    mesh476_mesh_18: Mesh;
    mesh476_mesh_19: Mesh;
    mesh476_mesh_20: Mesh;
    mesh476_mesh_21: Mesh;
    mesh476_mesh_22: Mesh;
    mesh476_mesh_23: Mesh;
    mesh476_mesh_24: Mesh;
    mesh476_mesh_25: Mesh;
  };
  materials: {
    PaletteMaterial001: THREE.MeshStandardMaterial;
  };
}

export const RotaryTool = (model: RotaryToolFull) =>
  (props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    return <Group {...props}>
      <MeshComponent
        geometry={nodes.M25_x_6mm_Screw.geometry}
        material={materials.PaletteMaterial001}
        position={[0.011, -0.002, -0.049]}
        rotation={[2.967, 0, 0]} />
      <InstancedMesh
        args={[nodes.mesh0_mesh.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_1.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_2.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_3.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_4.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_5.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_6.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_7.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_8.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_9.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_10.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_11.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_12.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_13.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_14.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_15.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_16.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_17.geometry, materials.PaletteMaterial001, 7]}
        instanceMatrix={nodes.mesh0_mesh_17.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_6.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_7.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_8.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_9.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_10.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_11.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_12.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_13.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_14.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_15.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_16.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_17.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_17.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_18.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_18.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_19.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_19.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_20.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_20.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_21.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_21.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_22.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_22.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_23.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_23.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_24.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_24.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh476_mesh_25.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh476_mesh_25.instanceMatrix} />
    </Group>;
  };
