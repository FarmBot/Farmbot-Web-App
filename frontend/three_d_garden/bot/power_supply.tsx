import React from "react";
import { RepeatWrapping } from "three";
import * as THREE from "three";
import { Box, Tube, useTexture } from "@react-three/drei";
import { ASSETS } from "../constants";
import { threeSpace, easyCubicBezierCurve3 } from "../helpers";
import { Config } from "../config";
import { Group, MeshPhongMaterial } from "../components";

export interface PowerSupplyProps {
  config: Config;
}

export const outletDepth = 25;
const plugDepth = 25;

let incr = 0;
const cableColor = (enabled: boolean) => {
  if (!enabled) { return "#222"; }
  const hue = incr * 80;
  incr++;
  return `hsl(${hue}, 100%, 50%)`;
};

export const PowerSupply = React.memo((props: PowerSupplyProps) => {
  const {
    bedWidthOuter, bedLengthOuter, bedHeight, botSizeX,
    legSize, ccSupportSize, bedZOffset, cableDebug,
  } = props.config;
  const zGround = React.useMemo(
    () => -bedHeight - bedZOffset,
    [bedHeight, bedZOffset],
  );
  const cableHeight = React.useMemo(
    () => 10 - Math.min(150, bedHeight / 2),
    [bedHeight],
  );
  const toX = React.useCallback(
    (value: number) => threeSpace(value, bedLengthOuter),
    [bedLengthOuter],
  );
  const toY = React.useCallback(
    (value: number) => threeSpace(value, bedWidthOuter),
    [bedWidthOuter],
  );

  const powerSupplyTexture = useTexture(ASSETS.textures.aluminum + "?=powerSupply");
  React.useEffect(() => {
    if (!powerSupplyTexture) { return; }
    powerSupplyTexture.wrapS = RepeatWrapping;
    powerSupplyTexture.wrapT = RepeatWrapping;
    powerSupplyTexture.repeat.set(0.01, 0.003);
  }, [powerSupplyTexture]);
  const powerSupplyPosition = React.useMemo(() => ([
    toX(bedLengthOuter / 2 + 300),
    toY(-21),
    -90 - ccSupportSize,
  ] as [number, number, number]), [
    toX,
    toY,
    bedLengthOuter,
    ccSupportSize,
  ]);
  const plugPosition = React.useMemo(() => ([
    toX(bedLengthOuter + 600 - plugDepth / 2 - outletDepth - legSize / 2),
    toY(legSize / 2),
    zGround + 250,
  ] as [number, number, number]), [
    toX,
    toY,
    bedLengthOuter,
    legSize,
    zGround,
  ]);
  const powerSupplyArgs = React.useMemo(() =>
    [163, 42, 68] as [number, number, number], []);
  const plugArgs = React.useMemo(() =>
    [plugDepth, 30, 30] as [number, number, number], []);
  const cableColorSet = React.useMemo(() => ({
    cable: cableColor(cableDebug),
    plug: cableColor(cableDebug),
  }), [cableDebug]);
  const combinedCablePath = React.useMemo(() => {
    const path = new THREE.CurvePath<THREE.Vector3>();
    const bedHalf = bedLengthOuter / 2;
    const supplyXStart = bedHalf + 300 - (163 / 2);
    const supplyXEnd = bedHalf + 300 + (163 / 2);
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(
        toX(botSizeX / 2),
        toY(-20),
        cableHeight,
      ),
      new THREE.Vector3(
        toX(bedHalf),
        toY(-20),
        cableHeight,
      ),
    ));
    path.add(easyCubicBezierCurve3(
      [toX(bedHalf), toY(-20), cableHeight],
      [100, 0, 0],
      [-100, 0, 0],
      [toX(supplyXStart), toY(-20), -90 - ccSupportSize],
    ));
    path.add(easyCubicBezierCurve3(
      [toX(supplyXEnd), toY(-20), -90 - ccSupportSize],
      [100, 0, 0],
      [-100, 0, 0],
      [toX(bedHalf + 500), toY(-20), -bedHeight + 10],
    ));
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(
        toX(bedHalf + 500),
        toY(-20),
        -bedHeight + 10,
      ),
      new THREE.Vector3(
        toX(bedLengthOuter - 150),
        toY(-20),
        -bedHeight + 10,
      ),
    ));
    path.add(easyCubicBezierCurve3(
      [toX(bedLengthOuter - 150), toY(-20), -bedHeight + 10],
      [100, 0, 0],
      [-100, 0, 0],
      [toX(bedLengthOuter - 50), toY(-20), zGround + 10],
    ));
    path.add(new THREE.LineCurve3(
      new THREE.Vector3(
        toX(bedLengthOuter - 50),
        toY(-20),
        zGround + 10,
      ),
      new THREE.Vector3(
        toX(bedLengthOuter + 400),
        toY(-20),
        zGround + 10,
      ),
    ));
    path.add(easyCubicBezierCurve3(
      [toX(bedLengthOuter + 400), toY(-20), zGround + 10],
      [100, 0, 0],
      [-100, 0, 0],
      [
        toX(bedLengthOuter + 550 - legSize / 2),
        toY(legSize / 2),
        zGround + 250,
      ],
    ));
    return path;
  }, [
    bedLengthOuter,
    bedHeight,
    botSizeX,
    cableHeight,
    ccSupportSize,
    legSize,
    toX,
    toY,
    zGround,
  ]);
  const powerCableArgs = React.useMemo(() => ([
    combinedCablePath,
    150,
    4,
    8,
  ] as [THREE.Curve<THREE.Vector3>, number, number, number]), [
    combinedCablePath,
  ]);

  return <Group name={"powerSupplyGroup"}>
    <Box name={"powerSupply"}
      castShadow={true}
      receiveShadow={true}
      args={powerSupplyArgs}
      position={powerSupplyPosition}>
      <MeshPhongMaterial map={powerSupplyTexture} color={"white"} />
    </Box>
    <Tube name={"powerCable"}
      castShadow={true}
      receiveShadow={true}
      args={powerCableArgs}>
      <MeshPhongMaterial color={cableColorSet.cable} />
    </Tube>
    <Box name={"powerPlug"}
      args={plugArgs}
      position={plugPosition}>
      <MeshPhongMaterial color={cableColorSet.plug} />
    </Box>
  </Group>;
});
