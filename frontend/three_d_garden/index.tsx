import { Circle, PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import { AmbientLight, DirectionalLight, MeshPhongMaterial } from "./components";
import { Config } from "./config";
import { Bed } from "./bed";
import { RepeatWrapping, TextureLoader } from "three";

export interface ThreeDGardenProps {
  config: Config;
}

export const ThreeDGarden = (props: ThreeDGardenProps) => {
  return <div className={"three-d-garden"}>
    <Canvas shadows={true}>
      <ThreeDGardenModel config={props.config} />
    </Canvas>
  </div>;
};

const grassTexture = new TextureLoader()
  .load("/3D/textures/grass.avif",
    texture => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(24, 24);
    });

export interface ThreeDGardenModelProps {
  config: Config;
}

export const ThreeDGardenModel = (props: ThreeDGardenModelProps) => {
  const mid = {
    x: props.config.bedLengthOuter / 2,
    y: props.config.bedWidthOuter / 2,
    z: props.config.bedHeight,
  };
  return <group name={"three-d-garden-model"}>
    <PerspectiveCamera makeDefault={true} name={"camera"}
      fov={40} near={10} far={75000}
      position={[2000, -4000, 2500]}
      rotation={[0, 0, 0]}
      up={[0, 0, 1]} />
    <OrbitControls maxPolarAngle={Math.PI / 2} dampingFactor={0.2}
      target={[mid.x, mid.y, mid.z]}
      minDistance={500} maxDistance={12000} />
    <AmbientLight intensity={1} />
    <DirectionalLight intensity={0.5} position={[0, 0, 1000]} />
    <Circle name={"ground"}
      receiveShadow={true}
      args={[30000, 16]}
      position={[0, 0, -10]}>
      <MeshPhongMaterial map={grassTexture} />
      <Bed config={props.config} />
    </Circle>
  </group>;
};
