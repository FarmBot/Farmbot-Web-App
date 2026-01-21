import React from "react";
import { Config, getSeasonProperties } from "../config";
import { Cloud, Clouds as DreiClouds } from "@react-three/drei";
import { ASSETS, RenderOrder } from "../constants";

export interface CloudsProps {
  config: Config;
}

export const Clouds = React.memo((props: CloudsProps) => {
  const { config } = props;
  const sunParams = React.useMemo(
    () => getSeasonProperties(config, "Summer"),
    [config],
  );
  const cloudPosition = React.useMemo<[number, number, number]>(
    () => [0, 0, 5000], []);
  const cloudBounds = React.useMemo<[number, number, number]>(
    () => [5000, 5000, 1000], []);
  const cloudSpeed = React.useMemo(
    () => config.animate ? 0.1 : 0,
    [config.animate],
  );
  return <DreiClouds name={"clouds"} visible={config.clouds}
    renderOrder={RenderOrder.clouds}
    texture={ASSETS.textures.cloud}>
    <Cloud position={cloudPosition}
      seed={0}
      bounds={cloudBounds}
      segments={80}
      volume={2500}
      smallestVolume={.4}
      concentrate="random"
      color="#ccc"
      growth={400}
      speed={cloudSpeed}
      opacity={sunParams.cloudOpacity}
      fade={5000} />
  </DreiClouds>;
});
