/* eslint-disable max-len */
import React from "react";
import * as THREE from "three";
import { InstancedBufferAttribute } from "three";
import { GLTF } from "three-stdlib";
import { Group, Mesh as MeshComponent, InstancedMesh } from "../../components";
import { ThreeElements } from "@react-three/fiber";

type Mesh = THREE.Mesh & { instanceMatrix: InstancedBufferAttribute | undefined };

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
    mesh0_mesh_26: Mesh;
    mesh0_mesh_27: Mesh;
    mesh0_mesh_28: Mesh;
    mesh0_mesh_29: Mesh;
    mesh0_mesh_30: Mesh;
    mesh0_mesh_31: Mesh;
    mesh0_mesh_32: Mesh;
    mesh0_mesh_33: Mesh;
    mesh0_mesh_34: Mesh;
    mesh0_mesh_35: Mesh;
    mesh0_mesh_36: Mesh;
    mesh0_mesh_37: Mesh;
    mesh0_mesh_38: Mesh;
    mesh0_mesh_39: Mesh;
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
  (props: ThreeElements["group"]) => {
    const { nodes, materials } = model;
    return <Group {...props}>
      <MeshComponent
        geometry={nodes.Cable_Carrier_Spacer_Block.geometry}
        material={materials.PaletteMaterial001}
        position={[0.03, 0.005, 0.061]}
        rotation={[-Math.PI / 2, 0, Math.PI]} />
      <InstancedMesh
        args={[nodes.mesh0_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_6.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_7.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_8.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_9.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_10.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_11.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_12.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_13.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_14.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_15.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_16.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_17.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_17.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_18.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_18.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_19.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_19.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_20.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_20.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_21.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_21.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_22.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_22.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_23.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_23.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_24.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_24.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_25.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_25.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_26.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_26.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_27.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_27.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_28.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_28.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_29.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_29.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_30.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_30.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_31.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_31.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_32.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_32.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_33.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_33.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_34.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_34.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_35.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_35.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_36.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_36.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_37.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_37.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_38.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_38.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh0_mesh_39.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh0_mesh_39.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_1.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_2.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_3.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_4.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_5.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_6.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_7.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_8.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_9.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_10.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_11.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_12.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_13.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_14.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_15.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_16.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh134_mesh_17.geometry, materials.PaletteMaterial001, 20]}
        instanceMatrix={nodes.mesh134_mesh_17.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_1.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_2.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_3.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_4.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_5.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_6.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_7.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_8.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_9.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_10.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_11.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_12.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_13.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_14.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_15.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh152_mesh_16.geometry, materials.PaletteMaterial001, 16]}
        instanceMatrix={nodes.mesh152_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_1.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_2.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_3.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_4.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_5.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_6.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_7.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_8.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_9.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_10.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_11.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_12.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_13.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_14.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_15.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_16.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_16.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh169_mesh_17.geometry, materials.PaletteMaterial001, 12]}
        instanceMatrix={nodes.mesh169_mesh_17.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_1.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_2.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_3.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_4.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_5.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_6.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_7.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_8.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_9.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_10.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_11.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_12.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_13.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_14.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_14.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh187_mesh_15.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh187_mesh_15.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_1.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_2.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_3.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_4.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_5.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_5.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_6.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_6.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_7.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_7.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_8.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_8.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_9.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_9.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_10.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_10.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_11.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_11.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_12.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_12.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh203_mesh_13.geometry, materials.PaletteMaterial001, 10]}
        instanceMatrix={nodes.mesh203_mesh_13.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh217_mesh.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh217_mesh.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh217_mesh_1.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh217_mesh_1.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh217_mesh_2.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh217_mesh_2.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh217_mesh_3.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh217_mesh_3.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh217_mesh_4.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh217_mesh_4.instanceMatrix} />
      <InstancedMesh
        args={[nodes.mesh217_mesh_5.geometry, materials.PaletteMaterial001, 5]}
        instanceMatrix={nodes.mesh217_mesh_5.instanceMatrix} />
    </Group>;
  };
