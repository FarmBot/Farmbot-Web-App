import React from "react";
import { Tube } from "@react-three/drei";
import { MeshPhongMaterial, Group } from "../../components";
import { WaterStream, useWaterFlowTexture } from "./water_stream";
import { Curve, Vector3 } from "three";
import { RenderOrder } from "../../constants";

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

const WaterTubeStream = (props: WaterTubeStreamProps) => {
  const {
    name, tubePath, tubularSegments, radius, radialSegments,
  } = props;
  const waterTexture = useWaterFlowTexture(true);
  return <WaterStream name={name}
    args={[tubePath, tubularSegments, radius - 2, radialSegments]}
    waterTexture={waterTexture}
    waterFlow={true} />;
};

export const WaterTube = (props: WaterTubeProps) => {
  const {
    tubeName, tubePath, tubularSegments, radius, radialSegments, waterFlow,
  } = props;

  return <Group name={tubeName}>
    <Tube name={tubeName + "-tube"}
      castShadow={true}
      receiveShadow={true}
      renderOrder={RenderOrder.one}
      args={[tubePath, tubularSegments, radius, radialSegments]}>
      <MeshPhongMaterial transparent={true}
        opacity={0.4} />
    </Tube>
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
