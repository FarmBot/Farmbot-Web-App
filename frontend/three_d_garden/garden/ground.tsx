import React from "react";
import { Config, detailLevels } from "../config";
import { Circle, Detailed, useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { MeshPhongMaterial } from "../components";
import { ASSETS, BigDistance } from "../constants";
import { RepeatWrapping, Texture } from "three";

export interface GroundProps {
  config: Config;
}

export const Ground = React.memo((props: GroundProps) => {
  const { config } = props;
  const { invalidate } = useThree();
  const groundZ = React.useMemo(
    () => config.bedZOffset + config.bedHeight,
    [config.bedHeight, config.bedZOffset],
  );

  const applyRepeat = React.useCallback(
    (texture: Texture, repeat: [number, number]) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.set(repeat[0], repeat[1]);
      texture.needsUpdate = true;
      invalidate?.();
    },
    [invalidate],
  );
  const configureGrassTexture = React.useCallback(
    (texture: Texture) => applyRepeat(texture, [24, 24]),
    [applyRepeat],
  );
  const configureLabFloorTexture = React.useCallback(
    (texture: Texture) => applyRepeat(texture, [16, 24]),
    [applyRepeat],
  );
  const configureBrickTexture = React.useCallback(
    (texture: Texture) => applyRepeat(texture, [30, 30]),
    [applyRepeat],
  );
  const grassTexture = useTexture(
    ASSETS.textures.grass + "?=grass",
    configureGrassTexture,
  );
  const labFloorTexture = useTexture(
    ASSETS.textures.concrete + "?=labFloor",
    configureLabFloorTexture,
  );
  const brickTexture = useTexture(
    ASSETS.textures.bricks + "?=bricks",
    configureBrickTexture,
  );

  const getGroundProperties = React.useCallback((sceneName: string) => {
    switch (sceneName) {
      case "Greenhouse":
        return {
          texture: brickTexture,
          color: "#999",
          lowDetailColor: "#8c6f64",
        };
      case "Lab":
        return {
          texture: labFloorTexture,
          color: "#aaa",
          lowDetailColor: "gray",
        };
      default:
        return {
          texture: grassTexture,
          color: "#ddd",
          lowDetailColor: "darkgreen",
        };
    }
  }, [brickTexture, grassTexture, labFloorTexture]);

  const groundProperties = React.useMemo(
    () => getGroundProperties(config.scene),
    [config.scene, getGroundProperties],
  );
  const groundPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, -groundZ],
    [groundZ],
  );
  const groundArgs = React.useMemo<[number, number]>(
    () => [BigDistance.ground, 16], []);
  const detailDistances = React.useMemo(
    () => detailLevels(config),
    [config],
  );

  const GroundWrapper = ({ children }: { children: React.ReactElement }) =>
    <Circle name={`ground ${config.scene}`}
      visible={config.ground}
      receiveShadow={true}
      args={groundArgs}
      position={groundPosition}>
      {children}
    </Circle>;

  return <Detailed distances={detailDistances}>
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
});
