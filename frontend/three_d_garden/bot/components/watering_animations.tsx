import React from "react";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import { ASSETS } from "../../constants";
import { Cloud, Clouds } from "@react-three/drei";
import {
  useSharedWaterFlowTexture, useWaterFlowTexture,
} from "./water_stream";
import { Texture } from "three";
import { Vector3Tuple } from "../kinematics";
import { WaterSprayGeometry } from "./water_spray_geometry";

const waterfallMistSegments = 30;
const groundMistSegments = 25;

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
  const [geometry] = React.useState(() =>
    new WaterSprayGeometry(nozzleRadius, geometryDistance));
  React.useLayoutEffect(() => {
    geometry.update(nozzleRadius, geometryDistance);
  }, [geometry, geometryDistance, nozzleRadius]);
  React.useLayoutEffect(() => () => geometry.dispose(), [geometry]);
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
    <Mesh name={"water-spray"}
      geometry={geometry}
      castShadow={true}
      receiveShadow={true}
      visible={waterFlow}>
      <MeshPhongMaterial map={props.waterTexture} />
    </Mesh>
    <Clouds name={"water-mist"} limit={waterfallMistSegments + groundMistSegments}
      texture={ASSETS.textures.cloud}>
      <Cloud name={"waterfall-mist-cloud"}
        position={[0, 0, nozzleToSoil / 2 - 40]}
        seed={0}
        bounds={[15, 15, nozzleToSoil / 2]}
        segments={waterfallMistSegments}
        volume={15}
        smallestVolume={0.1}
        concentrate={"inside"}
        color={"rgb(80, 210, 255)"}
        growth={40}
        speed={3}
        opacity={0.4}
        fade={5} />
      <Cloud name={"water-spot-mist-cloud"}
        position={[0, 0, nozzleToSoil]}
        seed={0}
        bounds={[30, 30, 30]}
        segments={groundMistSegments}
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
