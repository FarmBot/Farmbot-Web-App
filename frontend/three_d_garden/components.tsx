import React from "react";
import {
  AmbientLightProps,
  AxesHelperProps,
  BoxGeometryProps,
  DirectionalLightProps,
  GroupProps,
  InstancedMeshProps,
  MeshBasicMaterialProps,
  MeshPhongMaterialProps,
  MeshProps,
  PointLightProps,
  PrimitiveProps,
} from "@react-three/fiber";

// Workaround to avoid disabling no-unknown-property rule
// eslint is marking props for THREE components starting with lowercase as unknown

export const AmbientLight = (props: AmbientLightProps) =>
  <ambientLight {...props} />;

export const DirectionalLight = (props: DirectionalLightProps) =>
  <directionalLight {...props} />;

export const Group = (props: GroupProps) =>
  <group {...props} />;

export const Mesh = (props: MeshProps) =>
  <mesh {...props} />;

export const PointLight = (props: PointLightProps) =>
  <pointLight {...props} />;

export const MeshPhongMaterial = (props: MeshPhongMaterialProps) =>
  <meshPhongMaterial {...props} />;

export const InstancedMesh = (props: InstancedMeshProps) =>
  <instancedMesh {...props} />;

export const Primitive = (props: PrimitiveProps) =>
  <primitive {...props} />;

export const BoxGeometry = (props: BoxGeometryProps) =>
  <boxGeometry {...props} />;

export const MeshBasicMaterial = (props: MeshBasicMaterialProps) =>
  <meshBasicMaterial {...props} />;

export const AxesHelper = (props: AxesHelperProps) =>
  <axesHelper {...props} />;
