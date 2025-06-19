import React from "react";
import { Config, getSeasonProperties } from "../config";
import { Vector3, PointLight as ThreePointLight, Mesh } from "three";
import { Group, MeshBasicMaterial, PointLight } from "../components";
import { Line, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import SunCalc from "suncalc";
import { range } from "lodash";
import moment from "moment";
import { SEASON_DURATIONS } from "../../promo/constants";

const sunDistance = 20000;
const sunDecay = 0;
const shadowNormalBias = 100;

const SUN_COLOR = ["#FFD700", "#FFEA00", "#FFF700", "#FFE066"];

export const getCycleLength = (season: string) =>
  SEASON_DURATIONS[season] || 20;

export interface SunProps {
  config: Config;
  startTimeRef?: React.RefObject<number>;
}

const offset = 50;
const SUN_OFFSETS: [number, number][] = [
  [0, 0],
  [0, offset],
  [offset, offset],
  [offset, 0],
];

const offsetSunPos =
  (sunPos: Vector3, index: number): [number, number, number] => {
    const offset = SUN_OFFSETS[index];
    return [sunPos.x + offset[0], sunPos.y + offset[1], sunPos.z];
  };

export const calcSunCoordinate = (
  date: Date,
  heading: number,
  latitude: number,
  longitude: number,
) => {
  const sunPosition = SunCalc.getPosition(date, latitude, longitude);
  const sunAzimuth = sunPosition.azimuth * (180 / Math.PI);
  return {
    azimuth: Math.round((sunAzimuth - heading + 90) % 360),
    inclination: Math.round(sunPosition.altitude * (180 / Math.PI)),
  };
};

export const sunPosition =
  (sunInclination: number, sunAzimuth: number): Vector3 => {
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

  const sunParams = getSeasonProperties(config, "Spring");
  const { sunIntensity, sunColor } = sunParams;

  const sunPos = sunPosition(config.sunInclination, config.sunAzimuth);

  const lightRefs = React.useRef<(ThreePointLight | null)[]>([]);
  const sphereRefs = React.useRef<(Mesh | null)[]>([]);

  useFrame(() => {
    if (!config.animateSeasons || !props.startTimeRef) { return; }

    const totalCycle = getCycleLength(config.plants);
    const currentTime = performance.now() / 1000;
    const t = currentTime - props.startTimeRef.current;
    const timeOffset = Math.min(t / totalCycle, 1) * 24 * 60 * 60;
    const date = moment().utc().startOf("day").add(timeOffset, "seconds").toDate();

    const position = (index: number) => {
      const { azimuth, inclination } = calcSunCoordinate(date, 0, 52, 0);
      const sunPos = sunPosition(inclination, azimuth);
      return offsetSunPos(sunPos, index);
    };

    lightRefs.current.forEach((light, index) => {
      if (light) {
        light.position?.set(...position(index));
      }
    });

    sphereRefs.current.forEach((sphere, index) => {
      if (sphere) {
        sphere.position.set(...position(index));
      }
    });
  });

  return <Group name={"sun"}>
    {range(4).map(index => {
      const position = offsetSunPos(sunPos, index);
      const color = SUN_COLOR[index];
      return <Group key={index} name={`sun_${index}`}>
        <PointLight
          ref={(el: ThreePointLight) => {
            if (el) { lightRefs.current[index] = el; }
          }}
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
          <Sphere
            ref={el => { if (el) { sphereRefs.current[index] = el; } }}
            args={[500, 16, 16]}
            position={position}>
            <MeshBasicMaterial color={color} />
          </Sphere>}
      </Group>;
    })}
  </Group>;
};
