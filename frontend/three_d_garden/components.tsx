import React from "react";
import {
  AmbientLightProps,
  DirectionalLightProps,
  GroupProps,
  MeshProps,
  PointLightProps,
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
