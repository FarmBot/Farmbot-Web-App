import React from "react";
import { MeshPhongMaterial, Group, Mesh } from "../../components";
import {
  WaterStream, useSharedWaterFlowTexture, useWaterFlowTexture,
} from "./water_stream";
import { Curve, Vector3 } from "three";
import { RenderOrder } from "../../constants";
import { useManagedTubeGeometry } from "./managed_tube_geometry";

export interface WaterTubeProps {
  tubeName: string;
  tubePath: Curve<Vector3>;
  tubularSegments: number;
  radius: number;
  radialSegments: number;
  waterFlow: boolean;
}

type WaterTubeStreamProps =
  Omit<WaterTubeProps, "tubeName"> & { name: string };

const LocalWaterTubeStream = (props: WaterTubeStreamProps) => {
  const {
    name, tubePath, tubularSegments, radius, radialSegments,
  } = props;
  const waterTexture = useWaterFlowTexture(true);
  return <WaterStream name={name}
    args={[tubePath, tubularSegments, radius - 2, radialSegments]}
    waterTexture={waterTexture}
    waterFlow={true} />;
};

const WaterTubeStream = (props: WaterTubeStreamProps) => {
  const sharedWaterTexture = useSharedWaterFlowTexture();
  if (!sharedWaterTexture) { return <LocalWaterTubeStream {...props} />; }
  const {
    name, tubePath, tubularSegments, radius, radialSegments,
  } = props;
  return <WaterStream name={name}
    args={[tubePath, tubularSegments, radius - 2, radialSegments]}
    waterTexture={sharedWaterTexture}
    waterFlow={true} />;
};

const WaterTubeBase = (props: WaterTubeProps) => {
  const {
    tubeName, tubePath, tubularSegments, radius, radialSegments, waterFlow,
  } = props;
  const geometry = useManagedTubeGeometry(
    tubePath,
    tubularSegments,
    radius,
    radialSegments,
    "bot.geometry.tube.solenoid",
  );

  return <Group name={tubeName}>
    <Mesh name={tubeName + "-tube"}
      castShadow={true}
      receiveShadow={true}
      renderOrder={RenderOrder.one}
      geometry={geometry}>
      <MeshPhongMaterial transparent={true}
        opacity={0.4} />
    </Mesh>
    {waterFlow &&
      <WaterTubeStream
        name={tubeName + "-water-stream"}
        tubePath={tubePath}
        tubularSegments={tubularSegments}
        radius={radius}
        radialSegments={radialSegments}
        waterFlow={waterFlow} />}
  </Group>;
};

export const waterTubePropsEqual = (
  prev: WaterTubeProps,
  next: WaterTubeProps,
) =>
  prev.tubeName === next.tubeName &&
  prev.tubePath === next.tubePath &&
  prev.tubularSegments === next.tubularSegments &&
  prev.radius === next.radius &&
  prev.radialSegments === next.radialSegments &&
  prev.waterFlow === next.waterFlow;

export const WaterTube = React.memo(WaterTubeBase, waterTubePropsEqual);
