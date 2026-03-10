import { ThreeElements } from "@react-three/fiber";
import React from "react";

export const AmbientLight = (props: ThreeElements["ambientLight"]) =>
  <ambientLight {...props} />;

export const DirectionalLight =
  React.forwardRef((props: ThreeElements["directionalLight"], ref) =>
    <directionalLight ref={ref} {...props} />);

export const Group = React.forwardRef((props: ThreeElements["group"], ref) =>
  <group ref={ref} {...props} />);

export const Mesh = React.forwardRef((props: ThreeElements["mesh"], ref) =>
  <mesh ref={ref} {...props} />);

export const PointLight =
  React.forwardRef((props: ThreeElements["pointLight"], ref) =>
    <pointLight ref={ref} {...props} />);

export const MeshPhongMaterial = (props: ThreeElements["meshPhongMaterial"]) =>
  <meshPhongMaterial {...props} />;

export const MeshNormalMaterial = (props: ThreeElements["meshNormalMaterial"]) =>
  <meshNormalMaterial {...props} />;

export const InstancedMesh =
  React.forwardRef((props: ThreeElements["instancedMesh"], ref) => (
    <instancedMesh ref={ref} {...props} />
  ));

export const Primitive = (props: ThreeElements["primitive"]) =>
  <primitive {...props} />;

export const BoxGeometry = (props: ThreeElements["boxGeometry"]) =>
  <boxGeometry {...props} />;

export const MeshBasicMaterial =
  React.forwardRef((props: ThreeElements["meshBasicMaterial"], ref) =>
    <meshBasicMaterial ref={ref} {...props} />);

export const AxesHelper = (props: ThreeElements["axesHelper"]) =>
  <axesHelper {...props} />;

export const SpotLight =
  React.forwardRef((props: ThreeElements["spotLight"], ref) =>
    <spotLight ref={ref} {...props} />);

export const MeshStandardMaterial =
  React.forwardRef((props: ThreeElements["meshStandardMaterial"], ref) =>
    <meshStandardMaterial ref={ref} {...props} />);

export const Points = (props: ThreeElements["points"]) => (
  <points {...props} />
);

export const BufferGeometry = (props: ThreeElements["bufferGeometry"]) => (
  <bufferGeometry {...props} />
);

export const BufferAttribute = (props: ThreeElements["bufferAttribute"]) => (
  <bufferAttribute {...props} />
);

export const PointsMaterial =
  React.forwardRef((props: ThreeElements["pointsMaterial"], ref) => (
    <pointsMaterial ref={ref} {...props} />
  ));

export const PlaneGeometry =
  React.forwardRef((props: ThreeElements["planeGeometry"], ref) => (
    <planeGeometry ref={ref} {...props} />
  ));

export const LineSegments =
  React.forwardRef((props: ThreeElements["lineSegments"], ref) => (
    <lineSegments ref={ref} {...props} />
  ));

export const LineBasicMaterial =
  React.forwardRef((props: ThreeElements["lineBasicMaterial"], ref) => (
    <lineBasicMaterial ref={ref} {...props} />
  ));

export const SphereGeometry =
  React.forwardRef((props: ThreeElements["sphereGeometry"], ref) => (
    <sphereGeometry ref={ref} {...props} />
  ));
