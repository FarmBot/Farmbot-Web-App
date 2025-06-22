import React from "react";
import { Config, detailLevels } from "../config";
import { Circle, Detailed, useTexture } from "@react-three/drei";
import { MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import { RepeatWrapping } from "three";

export interface GroundProps {
  config: Config;
}

export const Ground = (props: GroundProps) => {
  const { config } = props;
  const groundZ = config.bedZOffset + config.bedHeight;

  const grassTexture = useTexture(ASSETS.textures.grass + "?=grass");
  grassTexture.wrapS = RepeatWrapping;
  grassTexture.wrapT = RepeatWrapping;
  grassTexture.repeat.set(24, 24);
  const labFloorTexture = useTexture(ASSETS.textures.concrete + "?=labFloor");
  labFloorTexture.wrapS = RepeatWrapping;
  labFloorTexture.wrapT = RepeatWrapping;
  labFloorTexture.repeat.set(16, 24);
  const brickTexture = useTexture(ASSETS.textures.bricks + "?=bricks");
  brickTexture.wrapS = RepeatWrapping;
  brickTexture.wrapT = RepeatWrapping;
  brickTexture.repeat.set(30, 30);

  const getGroundProperties = (sceneName: string) => {
    switch (sceneName) {
      case "Greenhouse":
        return { texture: brickTexture, color: "#999", lowDetailColor: "#8c6f64" };
      case "Lab":
        return { texture: labFloorTexture, color: "#aaa", lowDetailColor: "gray" };
      default:
        return { texture: grassTexture, color: "#ddd", lowDetailColor: "darkgreen" };
    }
  };

  const groundProperties = getGroundProperties(config.scene);

  const GroundWrapper = ({ children }: { children: React.ReactElement }) =>
    <Circle name={`ground ${config.scene}`}
      visible={config.ground}
      receiveShadow={true}
      args={[BigDistance.ground, 16]}
      position={[0, 0, -groundZ]}>
      {children}
    </Circle>;

  return <Detailed distances={detailLevels(config)}>
    <GroundWrapper>
      <MeshPhongMaterial
        map={groundProperties.texture}
        color={groundProperties.color}
        shininess={0} />
    </GroundWrapper>
    <GroundWrapper>
      <MeshPhongMaterial
        color={groundProperties.lowDetailColor}
        shininess={0} />
    </GroundWrapper>
  </Detailed>;
};
