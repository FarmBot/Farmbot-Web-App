/* eslint-disable max-len */
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

export const PowerSupply = (props: PowerSupplyProps) => {
  const {
    bedWidthOuter, bedLengthOuter, bedHeight, botSizeX,
    legSize, ccSupportSize, bedZOffset
  } = props.config;
  const zGround = -bedHeight - bedZOffset;

  const powerSupplyTexture = useTexture(ASSETS.textures.aluminum + "?=powerSupply");
  powerSupplyTexture.wrapS = RepeatWrapping;
  powerSupplyTexture.wrapT = RepeatWrapping;
  powerSupplyTexture.repeat.set(0.01, 0.003);

  const combinedCablePath = new THREE.CurvePath<THREE.Vector3>();

  const powerCableInCC = new THREE.LineCurve3(
    new THREE.Vector3(
      threeSpace(botSizeX / 2, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      10 - Math.min(150, bedHeight / 2),
    ),
    new THREE.Vector3(
      threeSpace(bedLengthOuter / 2, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      10 - Math.min(150, bedHeight / 2),
    ),
  );
  combinedCablePath.add(powerCableInCC);

  const powerCableFromSupplyToCC = easyCubicBezierCurve3(
    [
      threeSpace(bedLengthOuter / 2 + 0, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      10 - Math.min(150, bedHeight / 2),
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      threeSpace(bedLengthOuter / 2 + 300 - (163 / 2), bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      -90 - ccSupportSize,
    ],
  );
  combinedCablePath.add(powerCableFromSupplyToCC);

  const powerCableFromGroundToSupply = easyCubicBezierCurve3(
    [
      threeSpace(bedLengthOuter / 2 + 300 + (163 / 2), bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      -90 - ccSupportSize,
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      threeSpace(bedLengthOuter / 2 + 500, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      -bedHeight + 10,
    ],
  );
  combinedCablePath.add(powerCableFromGroundToSupply);

  const powerCableFromBedEndToSupply = new THREE.LineCurve3(
    new THREE.Vector3(threeSpace(bedLengthOuter / 2 + 500, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      -bedHeight + 10),
    new THREE.Vector3(threeSpace(bedLengthOuter - 150, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      -bedHeight + 10),
  );
  combinedCablePath.add(powerCableFromBedEndToSupply);

  const powerCableFromGroundToBedEnd = easyCubicBezierCurve3(
    [
      threeSpace(bedLengthOuter - 150, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      -bedHeight + 10,
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      threeSpace(bedLengthOuter - 50, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      zGround + 10,
    ],
  );

  combinedCablePath.add(powerCableFromGroundToBedEnd);
  const powerCableFromPostToBedEnd = new THREE.LineCurve3(
    new THREE.Vector3(threeSpace(bedLengthOuter - 50, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      zGround + 10),
    new THREE.Vector3(threeSpace(bedLengthOuter + 400, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      zGround + 10),
  );
  combinedCablePath.add(powerCableFromPostToBedEnd);

  const powerCableFromOutletToGround = easyCubicBezierCurve3(
    [
      threeSpace(bedLengthOuter + 400, bedLengthOuter),
      threeSpace(-20, bedWidthOuter),
      zGround + 10,
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      threeSpace(bedLengthOuter + 550 - legSize / 2, bedLengthOuter),
      threeSpace(legSize / 2, bedWidthOuter),
      zGround + 250,
    ],
  );
  combinedCablePath.add(powerCableFromOutletToGround);

  return <Group name={"powerSupplyGroup"}>
    <Box name={"powerSupply"}
      castShadow={true}
      receiveShadow={true}
      args={[163, 42, 68]}
      position={[
        threeSpace(bedLengthOuter / 2 + 300, bedLengthOuter),
        threeSpace(-21, bedWidthOuter),
        -90 - ccSupportSize,
      ]}>
      <MeshPhongMaterial map={powerSupplyTexture} color={"white"} />
    </Box>
    <Tube name={"powerCable"}
      castShadow={true}
      receiveShadow={true}
      args={[combinedCablePath, 150, 4, 8]}>
      <MeshPhongMaterial color={cableColor(props.config.cableDebug)} />
    </Tube>
    <Box name={"powerPlug"}
      args={[plugDepth, 30, 30]}
      position={[
        threeSpace(bedLengthOuter + 600 - plugDepth / 2 - outletDepth - legSize / 2,
          bedLengthOuter),
        threeSpace(legSize / 2, bedWidthOuter),
        zGround + 250,
      ]}>
      <MeshPhongMaterial color={cableColor(props.config.cableDebug)} />
    </Box>
  </Group>;
};
