import React from "react";
import { range } from "lodash";
import { Group } from "../../components";
import { ASSETS } from "../../constants";
import { Cloud, Clouds } from "@react-three/drei";
import { WaterStream } from "./water_stream";
import {
  easyCubicBezierCurve3, get3DPositionNoMirrorFunc, zDir, zZero,
} from "../../helpers";
import { Config, PositionConfig } from "../../config";
import { utmHeight } from "../bot";

export interface WateringAnimationsProps {
  waterFlow: boolean;
  config: Config;
  configPosition: PositionConfig;
  getZ(x: number, y: number): number;
}

export const WateringAnimations = (props: WateringAnimationsProps) => {
  const { waterFlow, getZ, config } = props;
  const { x, y, z } = props.configPosition;
  const get3DPosition = get3DPositionNoMirrorFunc(config);
  const utmZ = -zDir(config) * z + utmHeight / 2 - 15;
  const nozzleToSoil = getZ(x, y) - utmZ;
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  const position = get3DPosition({ x, y });
  return <Group name={"watering-animations"}
    visible={visible}
    position={[
      position.x,
      position.y,
      zZero(config),
    ]}>
    {range(16).map(i => {
      const angle = (i * Math.PI * 2) / 16;
      return <WaterStream key={i}
        name={`water-stream-${i}`}
        waterFlow={waterFlow}
        position={[0, 0, utmZ]}
        args={[easyCubicBezierCurve3(
          [12.5 * Math.sin(angle), 12.5 * Math.cos(angle), 0],
          [10 * Math.sin(angle), 0, -10],
          [0, 0, 10],
          [25 * Math.sin(angle), 25 * Math.cos(angle), nozzleToSoil],
        ), 8, 1.5, 6]} />;
    })}
    <Clouds name={"waterfall-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={[0, 0, utmZ + nozzleToSoil / 2 - 40]}
        seed={0}
        bounds={[15, 15, nozzleToSoil / 2]}
        segments={30}
        volume={15}
        smallestVolume={0.1}
        concentrate={"inside"}
        color={"rgb(80, 210, 255)"}
        growth={40}
        speed={3}
        opacity={0.4}
        fade={5} />
    </Clouds>
    <Clouds name={"water-spot-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={[0, 0, getZ(x, y)]}
        seed={0}
        bounds={[30, 30, 30]}
        segments={25}
        volume={100}
        smallestVolume={0.1}
        concentrate={"inside"}
        color={"rgb(80, 210, 255)"}
        growth={50}
        speed={3}
        opacity={0.5}
        fade={5} />
    </Clouds>
  </Group>;
};
