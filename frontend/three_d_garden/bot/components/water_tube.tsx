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

export const WaterTube = React.memo((props: WaterTubeProps) => {
  const {
    tubeName, tubePath, tubularSegments, radius, radialSegments, waterFlow,
  } = props;
  const tubeArgs = React.useMemo<[Curve<Vector3>, number, number, number]>(
    () => ([
      tubePath,
      tubularSegments,
      radius,
      radialSegments,
    ]),
    [tubePath, tubularSegments, radius, radialSegments],
  );
  const streamArgs = React.useMemo<[Curve<Vector3>, number, number, number]>(
    () => ([
      tubePath,
      tubularSegments,
      radius - 2,
      radialSegments,
    ]),
    [tubePath, tubularSegments, radius, radialSegments],
  );
  const tubeId = React.useMemo(() => `${tubeName}-tube`, [tubeName]);
  const streamId = React.useMemo(
    () => `${tubeName}-water-stream`, [tubeName]);

  return <Group name={tubeName}>
    <Tube name={tubeId}
      castShadow={true}
      receiveShadow={true}
      renderOrder={RenderOrder.one}
      args={tubeArgs}>
      <MeshPhongMaterial transparent={true}
        opacity={0.4} />
    </Tube>
    <WaterStream name={streamId}
      args={streamArgs}
      waterFlow={waterFlow} />
  </Group>;
});
