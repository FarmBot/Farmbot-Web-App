/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { InstancedBufferAttribute } from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent, InstancedMesh } from "../../components";
import { ThreeElements } from "@react-three/fiber";

type Mesh = THREE.Mesh & { instanceMatrix: InstancedBufferAttribute | undefined };

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
  (props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    return <Group {...props}>
      <MeshComponent
        geometry={nodes.Gantry_Wheel_Plate.geometry}
        material={materials.PaletteMaterial001}
        position={[0.002, 0.05, 0]}
        rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
      <InstancedMesh
        args={[nodes.mesh141_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_6.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_7.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_8.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_9.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_10.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_11.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_12.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_13.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_14.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_15.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_16.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh141_mesh_17.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh141_mesh_17.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_6.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_7.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_8.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_9.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_10.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_11.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_12.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_13.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_14.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_15.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh159_mesh_16.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh159_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_6.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_7.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_8.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_9.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_10.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_11.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_12.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_13.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_14.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh176_mesh_15.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh176_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_6.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_7.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_8.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_9.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_10.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_11.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_12.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh192_mesh_13.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh192_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_1.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_2.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_3.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_4.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_5.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_6.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_7.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_8.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_9.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_10.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_11.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_12.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_13.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_14.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_15.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_16.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh206_mesh_17.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh206_mesh_17.instanceMatrix} />
    </Group>;
  };
