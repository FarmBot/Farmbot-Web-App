import React from "react";
import { Cylinder } from "@react-three/drei";
import { Config } from "../../config";
import { threeSpace, easyCubicBezierCurve3 } from "../../helpers";
import { Group, MeshPhongMaterial } from "../../components";
import { WaterTube } from "./water_tube";

export interface XAxisWaterTubeProps {
  config: Config;
}

export const XAxisWaterTube = React.memo((props: XAxisWaterTubeProps) => {
  const { config } = props;
  const groundZ = React.useMemo(
    () => -config.bedHeight - config.bedZOffset,
    [config.bedHeight, config.bedZOffset],
  );
  const barbX = React.useMemo(
    () => threeSpace(config.bedLengthOuter / 2 + 400, config.bedLengthOuter),
    [config.bedLengthOuter],
  );
  const barbY = React.useMemo(
    () => threeSpace(-50, config.bedWidthOuter),
    [config.bedWidthOuter],
  );
  const barbZ = React.useMemo(() => groundZ + 20, [groundZ]);
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
  const barbPositionLeft = React.useMemo<[number, number, number]>(
    () => [barbX - 10, barbY, barbZ],
    [barbX, barbY, barbZ],
  );
  const barbPositionRight = React.useMemo<[number, number, number]>(
    () => [barbX + 10, barbY, barbZ],
    [barbX, barbY, barbZ],
  );
  const adapterRotation = React.useMemo<[number, number, number]>(
    () => [0, 0, Math.PI / 2], []);

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
      position={barbPositionLeft}
      rotation={adapterRotation}>
      <MeshPhongMaterial color={"gold"} />
    </Cylinder>
    <Cylinder name={"adapter-base"}
      receiveShadow={true}
      args={[18, 18, 20]}
      position={barbPositionRight}
      rotation={adapterRotation}>
      <MeshPhongMaterial color={"gold"} />
    </Cylinder>
  </Group>;
});
