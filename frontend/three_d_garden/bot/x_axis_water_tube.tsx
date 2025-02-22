import React from "react";
import { Cylinder, Tube } from "@react-three/drei";
import { Config } from "../config";
import { threeSpace, easyCubicBezierCurve3 } from "../helpers";
import { Group, MeshPhongMaterial } from "../components";
import { useWaterFlowTexture } from "./water_flow_texture";

export interface XAxisWaterTubeProps {
  config: Config;
}

export const XAxisWaterTube = (props: XAxisWaterTubeProps) => {
  const { config } = props;
  const groundZ = -config.bedHeight - config.bedZOffset;
  const barbX = threeSpace(config.bedLengthOuter / 2 + 400, config.bedLengthOuter);
  const barbY = threeSpace(-50, config.bedWidthOuter);
  const barbZ = groundZ + 20;
  const tubePath = easyCubicBezierCurve3(
    [barbX, barbY, barbZ],
    [-300, 0, 0],
    [300, 0, 0],
    [
      threeSpace(config.bedLengthOuter / 2 - 20, config.bedLengthOuter),
      threeSpace(-30, config.bedWidthOuter),
      -140,
    ],
  );

  const waterTexture = useWaterFlowTexture(config.waterFlow);

  return (
    <Group key={config.waterFlow ? "flowing" : "static"}>
      <Tube name={"x-axis-water-tube"}
        castShadow={true}
        receiveShadow={true}
        args={[tubePath, 20, 5, 8]}>
        <MeshPhongMaterial
          map={config.waterFlow ? waterTexture : undefined}
          transparent={true}
          opacity={config.waterFlow ? 0.75 : 0.5} />
      </Tube>
      <Cylinder name={"adapter-barb"}
        receiveShadow={true}
        args={[3.5, 3.5, 20]}
        position={[barbX - 10, barbY, barbZ]}
        rotation={[0, 0, Math.PI / 2]}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
      <Cylinder name={"adapter-base"}
        receiveShadow={true}
        args={[18, 18, 20]}
        position={[barbX + 10, barbY, barbZ]}
        rotation={[0, 0, Math.PI / 2]}>
        <MeshPhongMaterial color={"gold"} />
      </Cylinder>
    </Group>
  );
};
