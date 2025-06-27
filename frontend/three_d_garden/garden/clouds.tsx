import React from "react";
import { Config, getSeasonProperties } from "../config";
import { Cloud, Clouds as DreiClouds } from "@react-three/drei";
import { ASSETS, RenderOrder } from "../constants";

export interface CloudsProps {
  config: Config;
}

export const Clouds = (props: CloudsProps) => {
  const { config } = props;
  const sunParams = getSeasonProperties(config, "Summer");
  return <DreiClouds name={"clouds"} visible={config.clouds}
    renderOrder={RenderOrder.clouds}
    texture={ASSETS.textures.cloud}>
    <Cloud position={[0, 0, 5000]}
      seed={0}
      bounds={[5000, 5000, 1000]}
      segments={80}
      volume={2500}
      smallestVolume={.4}
      concentrate="random"
      color="#ccc"
      growth={400}
      speed={.1}
      opacity={sunParams.cloudOpacity}
      fade={5000} />
  </DreiClouds>;
};
