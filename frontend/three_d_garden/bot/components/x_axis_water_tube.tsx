import React from "react";
import { Cylinder } from "@react-three/drei";
import { Config } from "../../config";
import { threeSpace, easyCubicBezierCurve3 } from "../../helpers";
import { Group, MeshPhongMaterial } from "../../components";
import { WaterTube } from "./water_tube";

export interface XAxisWaterTubeProps {
  config: Config;
}

const X_AXIS_WATER_TUBE_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedWidthOuter",
  "bedZOffset",
  "waterFlow",
];

export const xAxisWaterTubePropsEqual = (
  prev: XAxisWaterTubeProps,
  next: XAxisWaterTubeProps,
) =>
  X_AXIS_WATER_TUBE_CONFIG_FIELDS.every(field =>
    prev.config[field] === next.config[field]);

const XAxisWaterTubeBase = (props: XAxisWaterTubeProps) => {
  const { config } = props;
  const groundZ = -config.bedHeight - config.bedZOffset;
  const barbX = threeSpace(config.bedLengthOuter / 2 + 400, config.bedLengthOuter);
  const barbY = threeSpace(-50, config.bedWidthOuter);
  const barbZ = groundZ + 20;
  const tubePath = React.useMemo(() => easyCubicBezierCurve3(
    [barbX, barbY, barbZ],
    [-300, 0, 0],
    [300, 0, 0],
    [
      threeSpace(config.bedLengthOuter / 2 - 20, config.bedLengthOuter),
      threeSpace(-30, config.bedWidthOuter),
      -140,
    ],
  ), [barbX, barbY, barbZ, config.bedLengthOuter, config.bedWidthOuter]);

  return <Group>
    <WaterTube tubeName={"x-axis-water-tube"}
      tubePath={tubePath}
      tubularSegments={20}
      radius={5}
      radialSegments={8}
      waterFlow={config.waterFlow} />
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
  </Group>;
};

export const XAxisWaterTube = React.memo(
  XAxisWaterTubeBase,
  xAxisWaterTubePropsEqual,
);
