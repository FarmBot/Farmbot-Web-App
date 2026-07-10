/* eslint-disable max-len */
import React from "react";
import { RepeatWrapping } from "three";
import * as THREE from "three";
import { Box, Tube } from "@react-three/drei";
import { ASSETS } from "../../constants";
import { easyCubicBezierCurve3 } from "../../helpers";
import { Config } from "../../config";
import { Group, MeshPhongMaterial } from "../../components";
import { useTextureVariant } from "../../texture_variants";

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

type PowerCableConfig = Pick<Config,
  "bedHeight" | "bedLengthOuter" | "bedXOffset" | "bedYOffset"
  | "bedZOffset" | "botSizeX" | "ccSupportSize" | "legSize">;

export const buildPowerCablePath = (
  config: PowerCableConfig,
): THREE.CurvePath<THREE.Vector3> => {
  const {
    bedHeight, bedLengthOuter, bedXOffset, bedYOffset, bedZOffset,
    botSizeX, ccSupportSize, legSize,
  } = config;
  const zGround = -bedHeight - bedZOffset;
  const localX = (position: number) => position - bedXOffset;
  const localY = (position: number) => position - bedYOffset;
  const cablePath = new THREE.CurvePath<THREE.Vector3>();

  const powerCableInCC = new THREE.LineCurve3(
    new THREE.Vector3(
      localX(botSizeX / 2),
      localY(-20),
      10 - Math.min(150, bedHeight / 2),
    ),
    new THREE.Vector3(
      localX(bedLengthOuter / 2),
      localY(-20),
      10 - Math.min(150, bedHeight / 2),
    ),
  );
  cablePath.add(powerCableInCC);

  const powerCableFromSupplyToCC = easyCubicBezierCurve3(
    [
      localX(bedLengthOuter / 2),
      localY(-20),
      10 - Math.min(150, bedHeight / 2),
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      localX(bedLengthOuter / 2 + 300 - (163 / 2)),
      localY(-20),
      -90 - ccSupportSize,
    ],
  );
  cablePath.add(powerCableFromSupplyToCC);

  const powerCableFromGroundToSupply = easyCubicBezierCurve3(
    [
      localX(bedLengthOuter / 2 + 300 + (163 / 2)),
      localY(-20),
      -90 - ccSupportSize,
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      localX(bedLengthOuter / 2 + 500),
      localY(-20),
      -bedHeight + 10,
    ],
  );
  cablePath.add(powerCableFromGroundToSupply);

  const powerCableFromBedEndToSupply = new THREE.LineCurve3(
    new THREE.Vector3(
      localX(bedLengthOuter / 2 + 500),
      localY(-20),
      -bedHeight + 10,
    ),
    new THREE.Vector3(
      localX(bedLengthOuter - 150),
      localY(-20),
      -bedHeight + 10,
    ),
  );
  cablePath.add(powerCableFromBedEndToSupply);

  const powerCableFromGroundToBedEnd = easyCubicBezierCurve3(
    [
      localX(bedLengthOuter - 150),
      localY(-20),
      -bedHeight + 10,
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      localX(bedLengthOuter - 50),
      localY(-20),
      zGround + 10,
    ],
  );
  cablePath.add(powerCableFromGroundToBedEnd);

  const powerCableFromPostToBedEnd = new THREE.LineCurve3(
    new THREE.Vector3(
      localX(bedLengthOuter - 50),
      localY(-20),
      zGround + 10,
    ),
    new THREE.Vector3(
      localX(bedLengthOuter + 400),
      localY(-20),
      zGround + 10,
    ),
  );
  cablePath.add(powerCableFromPostToBedEnd);

  const powerCableFromOutletToGround = easyCubicBezierCurve3(
    [
      localX(bedLengthOuter + 400),
      localY(-20),
      zGround + 10,
    ],
    [100, 0, 0],
    [-100, 0, 0],
    [
      localX(bedLengthOuter + 550 - legSize / 2),
      localY(legSize / 2),
      zGround + 250,
    ],
  );
  cablePath.add(powerCableFromOutletToGround);

  return cablePath;
};

const PowerSupplyHardwareBase = (props: PowerSupplyProps) => {
  const {
    bedLengthOuter, bedHeight, bedXOffset, bedYOffset,
    legSize, ccSupportSize, bedZOffset,
  } = props.config;
  const zGround = -bedHeight - bedZOffset;
  const powerSupplyTexture = useTextureVariant(ASSETS.textures.aluminum, {
    wrapS: RepeatWrapping,
    wrapT: RepeatWrapping,
    repeat: [0.01, 0.003],
  });

  return <Group name={"power-supply-hardware"}>
    <Box name={"powerSupply"}
      castShadow={true}
      receiveShadow={true}
      args={[163, 42, 68]}
      position={[
        bedLengthOuter / 2 + 300 - bedXOffset,
        -21 - bedYOffset,
        -90 - ccSupportSize,
      ]}>
      <MeshPhongMaterial map={powerSupplyTexture} color={"white"} />
    </Box>
    <Box name={"powerPlug"}
      args={[plugDepth, 30, 30]}
      position={[
        bedLengthOuter + 600 - plugDepth / 2 - outletDepth
          - legSize / 2 - bedXOffset,
        legSize / 2 - bedYOffset,
        zGround + 250,
      ]}>
      <MeshPhongMaterial color={cableColor(props.config.cableDebug)} />
    </Box>
  </Group>;
};

const PowerCableBase = (props: PowerSupplyProps) => {
  const { config } = props;
  const {
    bedHeight, bedLengthOuter, bedXOffset, bedYOffset, bedZOffset,
    botSizeX, ccSupportSize, legSize,
  } = config;
  const combinedCablePath = React.useMemo(
    () => buildPowerCablePath({
      bedHeight,
      bedLengthOuter,
      bedXOffset,
      bedYOffset,
      bedZOffset,
      botSizeX,
      ccSupportSize,
      legSize,
    }),
    [
      bedHeight,
      bedLengthOuter,
      bedXOffset,
      bedYOffset,
      bedZOffset,
      botSizeX,
      ccSupportSize,
      legSize,
    ],
  );
  return <Tube name={"powerCable"}
    castShadow={true}
    receiveShadow={true}
    args={[combinedCablePath, 150, 4, 8]}>
    <MeshPhongMaterial color={cableColor(config.cableDebug)} />
  </Tube>;
};

const POWER_SUPPLY_HARDWARE_CONFIG_FIELDS: (keyof Config)[] = [
  "bedHeight",
  "bedLengthOuter",
  "bedXOffset",
  "bedYOffset",
  "bedZOffset",
  "cableDebug",
  "ccSupportSize",
  "legSize",
];

const POWER_CABLE_CONFIG_FIELDS: (keyof Config)[] = [
  ...POWER_SUPPLY_HARDWARE_CONFIG_FIELDS,
  "botSizeX",
];

const powerSupplyPropsEqualFor = (
  fields: (keyof Config)[],
  prev: PowerSupplyProps,
  next: PowerSupplyProps,
) =>
  !prev.config.cableDebug &&
  !next.config.cableDebug &&
  fields.every(field => prev.config[field] === next.config[field]);

export const powerSupplyHardwarePropsEqual = (
  prev: PowerSupplyProps,
  next: PowerSupplyProps,
) => powerSupplyPropsEqualFor(
  POWER_SUPPLY_HARDWARE_CONFIG_FIELDS,
  prev,
  next,
);

export const powerCablePropsEqual = (
  prev: PowerSupplyProps,
  next: PowerSupplyProps,
) => powerSupplyPropsEqualFor(POWER_CABLE_CONFIG_FIELDS, prev, next);

export const PowerSupplyHardware = React.memo(
  PowerSupplyHardwareBase,
  powerSupplyHardwarePropsEqual,
);

export const PowerCable = React.memo(PowerCableBase, powerCablePropsEqual);
