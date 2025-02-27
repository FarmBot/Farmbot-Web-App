import React from "react";
import { Tube } from "@react-three/drei";
import { MeshPhongMaterial, Group } from "../../components";
import { WaterStream } from "./water_stream";

export interface WaterTubeProps {
  name: string;
  args: Parameters<typeof Tube>[0]["args"];
  waterFlow: boolean;
}

export const WaterTube = (props: WaterTubeProps) => {
  const { name, args, waterFlow } = props;
  const [tubePath, tubularSegments, radius = 5, radialSegments] = args || [];

  return <Group name={name}>
    <Tube name={name + "-tube"}
      castShadow={true}
      receiveShadow={true}
      renderOrder={1}
      args={args}>
      <MeshPhongMaterial transparent={true}
        opacity={0.4} />
    </Tube>
    <WaterStream name={name + "-water-stream"}
      args={[tubePath, tubularSegments, radius - 2, radialSegments]}
      waterFlow={waterFlow} />
  </Group>;
};
