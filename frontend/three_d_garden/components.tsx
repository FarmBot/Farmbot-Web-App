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

export const Group = React.forwardRef((props: ThreeElements["group"], ref) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <group ref={ref} {...props} />);

export const Mesh = React.forwardRef((props: ThreeElements["mesh"], ref) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <mesh ref={ref} {...props} />);

export const PointLight =
  React.forwardRef((props: ThreeElements["pointLight"], ref) =>
    // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
    <pointLight ref={ref} {...props} />);

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

export const MeshBasicMaterial =
  React.forwardRef((props: ThreeElements["meshBasicMaterial"], ref) =>
    // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
    <meshBasicMaterial ref={ref} {...props} />);

export const AxesHelper = (props: ThreeElements["axesHelper"]) =>
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <axesHelper {...props} />;

export const SpotLight =
  React.forwardRef((props: ThreeElements["spotLight"], ref) =>
    // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
    <spotLight ref={ref} {...props} />);

export const MeshStandardMaterial =
  React.forwardRef((props: ThreeElements["meshStandardMaterial"], ref) =>
    // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
    <meshStandardMaterial ref={ref} {...props} />);

export const Points = (props: ThreeElements["points"]) => (
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <points {...props} />
);

export const BufferGeometry = (props: ThreeElements["bufferGeometry"]) => (
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <bufferGeometry {...props} />
);

export const BufferAttribute = (props: ThreeElements["bufferAttribute"]) => (
  // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
  <bufferAttribute {...props} />
);

export const PointsMaterial =
  React.forwardRef((props: ThreeElements["pointsMaterial"], ref) => (
    // @ts-expect-error Property does not exist on type JSX.IntrinsicElements
    <pointsMaterial ref={ref} {...props} />
  ));
