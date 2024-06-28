import { Circle, PerspectiveCamera, OrbitControls, Box } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { AmbientLight, DirectionalLight } from "./components";

export interface ThreeDGardenProps {
}

export const ThreeDGarden = (props: ThreeDGardenProps) => {
  props;
  return <div className={"three-d-garden"}>
    <Canvas shadows={true}>
      <ThreeDGardenModel />
    </Canvas>
  </div>;
};

export interface ThreeDGardenModelProps {
}

export const ThreeDGardenModel = (props: ThreeDGardenModelProps) => {
  props;
  return <group name={"three-d-garden-model"}>
    <PerspectiveCamera makeDefault={true} name={"camera"}
      fov={40} near={10} far={75000}
      position={[2000, -4000, 2500]}
      rotation={[0, 0, 0]}
      up={[0, 0, 1]} />
    <OrbitControls maxPolarAngle={Math.PI / 2} dampingFactor={0.2}
      target={[0, 0, 0]}
      minDistance={500} maxDistance={12000} />
    <AmbientLight intensity={1} />
    <DirectionalLight intensity={0.5} position={[0, 0, 1000]} />
    <Circle name={"ground"}
      receiveShadow={true}
      args={[30000, 16]}
      position={[0, 0, -10]}>
      <meshPhongMaterial color={"darkgreen"} />
      <Box
        args={[3000, 1500, 400]}
        position={[0, 0, 400 / 2]}
        receiveShadow={true}>
        <meshPhongMaterial color={"tan"} />
      </Box>
    </Circle>
  </group>;
};
