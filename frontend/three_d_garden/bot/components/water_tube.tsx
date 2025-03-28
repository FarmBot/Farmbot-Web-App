import React from "react";
import { Tube } from "@react-three/drei";
import { MeshPhongMaterial, Group } from "../../components";
import { WaterStream } from "./water_stream";
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
    <WaterStream name={tubeName + "-water-stream"}
      args={[tubePath, tubularSegments, radius - 2, radialSegments]}
      waterFlow={waterFlow} />
  </Group>;
};
