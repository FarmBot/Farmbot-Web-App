import React from "react";
import { range } from "lodash";
import { Group } from "../../components";
import { ASSETS } from "../../constants";
import { Cloud, Clouds } from "@react-three/drei";
import {
  WaterStream, useSharedWaterFlowTexture, useWaterFlowTexture,
} from "./water_stream";
import { easyCubicBezierCurve3 } from "../../helpers";
import { Texture } from "three";
import { Vector3Tuple } from "../kinematics";

export interface WateringAnimationsProps {
  waterFlow: boolean;
  nozzlePosition: Vector3Tuple;
  nozzleToSoil: number;
  nozzleRadius: number;
}

export const wateringAnimationsPropsEqual = (
  prev: WateringAnimationsProps,
  next: WateringAnimationsProps,
) => prev.waterFlow === next.waterFlow &&
  prev.nozzleToSoil === next.nozzleToSoil &&
  prev.nozzleRadius === next.nozzleRadius &&
  prev.nozzlePosition.every((value, i) => value === next.nozzlePosition[i]);

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
  const { waterFlow, nozzlePosition, nozzleToSoil, nozzleRadius } = props;
  const geometryDistance = Math.round(nozzleToSoil);
  const streamPaths = React.useMemo(() => range(16).map(i => {
    const angle = (i * Math.PI * 2) / 16;
    return easyCubicBezierCurve3(
      [nozzleRadius * Math.sin(angle), nozzleRadius * Math.cos(angle), 0],
      [10 * Math.sin(angle), 0, -10],
      [0, 0, 10],
      [
        25 * Math.sin(angle),
        25 * Math.cos(angle),
        geometryDistance,
      ],
    );
  }), [geometryDistance, nozzleRadius]);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);
  return <Group name={"watering-animations"}
    visible={visible}
    position={nozzlePosition}>
    {streamPaths.map((path, i) =>
      <WaterStream key={i}
        name={`water-stream-${i}`}
        waterFlow={waterFlow}
        waterTexture={props.waterTexture}
        position={[0, 0, 0]}
        args={[path, 8, 1.5, 6]} />)}
    <Clouds name={"waterfall-mist"}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={[0, 0, nozzleToSoil / 2 - 40]}
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
        position={[0, 0, nozzleToSoil]}
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
