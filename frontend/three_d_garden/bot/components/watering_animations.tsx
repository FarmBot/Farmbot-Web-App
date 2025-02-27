import React from "react";
import { range } from "lodash";
import { Group } from "../../components";
import { ASSETS } from "../../constants";
import { Cloud, Clouds as DreiClouds } from "@react-three/drei";
import { WaterStream } from "./water_stream";
import { easyCubicBezierCurve3 } from "../../helpers";

interface WateringAnimationsProps {
  waterFlow: boolean;
  botPositionZ: number;
  soilHeight: number;
}

export const WateringAnimations = (props: WateringAnimationsProps) => {
  const { waterFlow, botPositionZ, soilHeight } = props;
  const nozzleToSoil = botPositionZ - soilHeight;

  return <Group name={"watering-animations"} visible={waterFlow}>
    {range(16).map(i => {
      const angle = (i * Math.PI * 2) / 16;
      return <WaterStream name={`water-stream-${i}`}
        key={i}
        waterFlow={waterFlow}
        args={[easyCubicBezierCurve3(
          [12.5 * Math.sin(angle), 12.5 * Math.cos(angle), 0],
          [10 * Math.sin(angle), 0, -10],
          [0, 0, 10],
          [25 * Math.sin(angle), 25 * Math.cos(angle), nozzleToSoil],
        ), 8, 1.5, 6]} />;
    })}
    <DreiClouds name={"waterfall-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud position={[0, 0, (nozzleToSoil) / 2 - 40]}
        seed={0}
        bounds={[15, 15, (nozzleToSoil) / 2]}
        segments={30}
        volume={15}
        smallestVolume={.1}
        concentrate="inside"
        color="rgb(80, 210, 255)"
        growth={40}
        speed={3}
        opacity={0.4}
        fade={5} />
    </DreiClouds>
    <DreiClouds name={"water-spot-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud position={[0, 0, nozzleToSoil + 40]}
        seed={0}
        bounds={[30, 30, 30]}
        segments={25}
        volume={100}
        smallestVolume={.1}
        concentrate="inside"
        color="rgb(80, 210, 255)"
        growth={50}
        speed={3}
        opacity={0.5}
        fade={5} />
    </DreiClouds>
  </Group>;
};
