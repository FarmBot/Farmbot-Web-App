import { ThreeElements } from "@react-three/fiber";
import React from "react";

// Workaround to avoid disabling no-unknown-property rule
// eslint is marking props for THREE components starting with lowercase as unknown

export const AmbientLight = (props: ThreeElements["ambientLight"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <ambientLight {...props} />;

export const DirectionalLight = (props: ThreeElements["directionalLight"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <directionalLight {...props} />;

export const Group = (props: ThreeElements["group"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <group {...props} />;

export const Mesh = (props: ThreeElements["mesh"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <mesh {...props} />;

export const PointLight = (props: ThreeElements["pointLight"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <pointLight {...props} />;

export const MeshPhongMaterial = (props: ThreeElements["meshPhongMaterial"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <meshPhongMaterial {...props} />;

export const InstancedMesh = (props: ThreeElements["instancedMesh"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <instancedMesh {...props} />;

export const Primitive = (props: ThreeElements["primitive"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <primitive {...props} />;

export const BoxGeometry = (props: ThreeElements["boxGeometry"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <boxGeometry {...props} />;

export const MeshBasicMaterial = (props: ThreeElements["meshBasicMaterial"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <meshBasicMaterial {...props} />;

export const AxesHelper = (props: ThreeElements["axesHelper"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <axesHelper {...props} />;
