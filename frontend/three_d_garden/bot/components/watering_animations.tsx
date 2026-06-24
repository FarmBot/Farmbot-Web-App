import React from "react";
import { range } from "lodash";
import { Group } from "../../components";
import { ASSETS } from "../../constants";
import { Cloud, Clouds } from "@react-three/drei";
import {
  WaterStream, useSharedWaterFlowTexture, useWaterFlowTexture,
} from "./water_stream";
import {
  easyCubicBezierCurve3, get3DPositionNoMirrorFunc, zDir, zZero,
} from "../../helpers";
import { Config, PositionConfig } from "../../config";
import { Texture } from "three";

export interface WateringAnimationsProps {
  waterFlow: boolean;
  config: Config;
  configPosition: PositionConfig;
  getZ(x: number, y: number): number;
}

const WATERING_ANIMATION_CONFIG_FIELDS: (keyof Config)[] = [
  "bedLengthOuter",
  "bedWidthOuter",
  "bedXOffset",
  "bedYOffset",
  "columnLength",
  "kitVersion",
  "negativeZ",
  "zGantryOffset",
];

export const wateringAnimationsPropsEqual = (
  prev: WateringAnimationsProps,
  next: WateringAnimationsProps,
) =>
  prev.waterFlow === next.waterFlow &&
  prev.getZ === next.getZ &&
  prev.configPosition.x === next.configPosition.x &&
  prev.configPosition.y === next.configPosition.y &&
  prev.configPosition.z === next.configPosition.z &&
  WATERING_ANIMATION_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

interface WateringAnimationsContentProps extends WateringAnimationsProps {
  waterTexture: Texture | undefined;
}

const LocalWateringAnimations = (props: WateringAnimationsProps) => {
  const waterTexture = useWaterFlowTexture(props.waterFlow);
  return <WateringAnimationsContent
    {...props}
    waterTexture={waterTexture} />;
};

const WateringAnimationsBase = (props: WateringAnimationsProps) => {
  const sharedWaterTexture = useSharedWaterFlowTexture();
  return sharedWaterTexture
    ? <WateringAnimationsContent
      {...props}
      waterTexture={sharedWaterTexture} />
    : <LocalWateringAnimations {...props} />;
};

export const WateringAnimations = React.memo(
  WateringAnimationsBase,
  wateringAnimationsPropsEqual,
);

const WateringAnimationsContent = (props: WateringAnimationsContentProps) => {
  const { waterFlow, getZ, config } = props;
  const { x, y, z } = props.configPosition;
  const get3DPosition = get3DPositionNoMirrorFunc(config);
  const baseZ = zZero(config);
  const nozzlePosition = config.kitVersion == "v1.9"
    ? {
      x: x - 99.5,
      y: y + 31.5,
      z: config.columnLength - baseZ + 77,
    }
    : {
      x,
      y,
      z: -zDir(config) * z + 35 / 2 - 15,
    };
  const nozzleToSoil = getZ(nozzlePosition.x, nozzlePosition.y) -
    nozzlePosition.z;
  const nozzleRadius = config.kitVersion == "v1.9" ? 9 : 12.5;
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  const position = get3DPosition({
    x: nozzlePosition.x,
    y: nozzlePosition.y,
  });
  return <Group name={"watering-animations"}
    visible={visible}
    position={[
      position.x,
      position.y,
      baseZ,
    ]}>
    {range(16).map(i => {
      const angle = (i * Math.PI * 2) / 16;
      return <WaterStream key={i}
        name={`water-stream-${i}`}
        waterFlow={waterFlow}
        waterTexture={props.waterTexture}
        position={[0, 0, nozzlePosition.z]}
        args={[easyCubicBezierCurve3(
          [nozzleRadius * Math.sin(angle), nozzleRadius * Math.cos(angle), 0],
          [10 * Math.sin(angle), 0, -10],
          [0, 0, 10],
          [25 * Math.sin(angle), 25 * Math.cos(angle), nozzleToSoil],
        ), 8, 1.5, 6]} />;
    })}
    <Clouds name={"waterfall-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={[0, 0, nozzlePosition.z + nozzleToSoil / 2 - 40]}
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
        position={[0, 0, getZ(nozzlePosition.x, nozzlePosition.y)]}
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
