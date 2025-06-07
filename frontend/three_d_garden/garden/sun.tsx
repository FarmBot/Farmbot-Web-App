import React from "react";
import { Config, seasonProperties } from "../config";
import { Vector3 } from "three";
import { useSpring, animated } from "@react-spring/three";
import { Group, MeshBasicMaterial, PointLight } from "../components";
import { Line, Sphere } from "@react-three/drei";

const AnimatedPointLight = animated(PointLight);

export interface SunProps {
  config: Config;
}

export const sunPosition = (config: Config): Vector3 => {
  const { sunInclination, sunAzimuth } = config;
  return new Vector3(
    10000
    * Math.cos(sunInclination * Math.PI / 180)
    * Math.sin(sunAzimuth * Math.PI / 180),
    10000
    * Math.cos(sunInclination * Math.PI / 180)
    * Math.cos(sunAzimuth * Math.PI / 180),
    10000
    * Math.sin(sunInclination * Math.PI / 180),
  );
};

export const Sun = (props: SunProps) => {
  const { config } = props;

  const sunParams = seasonProperties(config.sun / 100);
  const { sunIntensity, sunColor } = useSpring({
    ...sunParams[config.plants] || sunParams.Spring,
    tension: 50,
    friction: 40,
  });

  const sunPos = sunPosition(config);
  const sunDistance = 20000;
  const sunDecay = 0;
  const shadowNormalBias = 100;
  const offset = 50;

  const SUN_COLOR = ["#FFD700", "#FFEA00", "#FFF700", "#FFE066"];

  return <Group name={"sun"}>
    {[
      [0, 0],
      [0, offset],
      [offset, offset],
      [offset, 0],
    ].map(([xOffset, yOffset], index) => {
      const position: [number, number, number] =
        [sunPos.x + xOffset, sunPos.y + yOffset, sunPos.z];
      const color = SUN_COLOR[index];
      return <Group key={index} name={`sun_${index}`}>
        <AnimatedPointLight
          intensity={sunIntensity}
          color={sunColor}
          distance={sunDistance}
          decay={sunDecay}
          castShadow={true}
          shadow-normalBias={shadowNormalBias} // warning: distorts shadows
          position={position}
        />
        {config.lightsDebug &&
          <Line points={[position, [0, 0, 0]]} color={color} />}
        {config.lightsDebug &&
          <Sphere args={[500, 16, 16]} position={position}>
            <MeshBasicMaterial color={color} />
          </Sphere>}
      </Group>;
    })}
  </Group>;
};
