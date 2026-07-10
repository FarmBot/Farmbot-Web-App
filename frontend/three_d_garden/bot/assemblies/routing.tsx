import React from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh as ThreeMesh } from "three";
import { Config, PositionConfig } from "../../config";
import { easyCubicBezierCurve3, zDir, zZero } from "../../helpers";
import { Group, Mesh, MeshPhongMaterial } from "../../components";
import {
  CableCarrierX, CableCarrierY, CableCarrierZ, PowerCable, Solenoid,
} from "../components";
import { XAxisBeltPair, YAxisBelt, ZAxisBelt } from "../belts";
import { BotVersion } from "../bot_versions";
import {
  EXTRUSION_WIDTH, X_TRACK_PADDING, machineOuterY,
} from "./constants";
import { usePerfRenderCount } from "../../../performance/perf";
import { useManagedTubeGeometry } from
  "../components/managed_tube_geometry";

export interface RoutingAssemblyProps {
  config: Config;
  configPosition: PositionConfig;
  positionRef?: React.MutableRefObject<PositionConfig>;
  version: BotVersion;
}

type RoutingConfigField = keyof Config;

const sameConfigFields = (
  prev: RoutingAssemblyProps,
  next: RoutingAssemblyProps,
  fields: RoutingConfigField[],
) => fields.every(field => prev.config[field] === next.config[field]);

const samePositionFields = (
  prev: RoutingAssemblyProps,
  next: RoutingAssemblyProps,
  fields: (keyof PositionConfig)[],
) => prev.positionRef && prev.positionRef === next.positionRef
  ? true
  : fields.every(field =>
    prev.configPosition[field] === next.configPosition[field]);

const X_ROUTING_CONFIG_FIELDS: RoutingConfigField[] = [
  "bedHeight", "bedWidthOuter", "bedYOffset", "botSizeX",
  "cableCarriers", "columnLength", "tracks",
];

const Y_ROUTING_CONFIG_FIELDS: RoutingConfigField[] = [
  "bedLengthOuter", "bedWidthOuter", "bedXOffset", "bedYOffset",
  "beamLength", "botSizeY", "cableCarriers", "columnLength",
  "kitVersion",
];

const Z_ROUTING_CONFIG_FIELDS: RoutingConfigField[] = [
  "bedLengthOuter", "bedWidthOuter", "bedXOffset", "bedYOffset",
  "botSizeY", "botSizeZ", "cableCarriers", "columnLength",
  "kitVersion", "negativeZ", "zGantryOffset",
];

export const xRoutingPropsEqual = (
  prev: RoutingAssemblyProps,
  next: RoutingAssemblyProps,
) => samePositionFields(prev, next, ["x"]) &&
  prev.positionRef === next.positionRef &&
  prev.version.number === next.version.number &&
  sameConfigFields(prev, next, X_ROUTING_CONFIG_FIELDS);

export const yRoutingPropsEqual = (
  prev: RoutingAssemblyProps,
  next: RoutingAssemblyProps,
) => samePositionFields(prev, next, ["x", "y"]) &&
  prev.positionRef === next.positionRef &&
  prev.version.number === next.version.number &&
  sameConfigFields(prev, next, Y_ROUTING_CONFIG_FIELDS);

export const zRoutingPropsEqual = (
  prev: RoutingAssemblyProps,
  next: RoutingAssemblyProps,
) => samePositionFields(prev, next, ["x", "y", "z"]) &&
  prev.positionRef === next.positionRef &&
  prev.version.number === next.version.number &&
  sameConfigFields(prev, next, Z_ROUTING_CONFIG_FIELDS);

const airTubeEndOffset = (
  version: BotVersion,
): [number, number, number] => {
  switch (version.number) {
    case "v1.7":
      return [52, 100, 210];
    case "v1.8":
      return [7, 0, 210];
    case "v1.9":
      return [7, 20, 210];
  }
};

export const airTubePosition = (
  config: Config,
  position: PositionConfig,
): [number, number, number] => [
  position.x + 17,
  position.y,
  zZero(config) - zDir(config) * position.z + 35,
];

const AirTubeBase = (props: RoutingAssemblyProps) => {
  const { config, configPosition, version } = props;
  const initialPosition = props.positionRef?.current || configPosition;
  const mesh = React.useRef<ThreeMesh | undefined>(undefined);
  const path = React.useMemo(() => easyCubicBezierCurve3(
    [0, 0, 0],
    [0, 0, 100],
    [0, 0, -200],
    airTubeEndOffset(version),
  ), [version]);
  const geometry = useManagedTubeGeometry(
    path,
    20,
    5,
    8,
    "bot.geometry.tube.air",
  );
  useFrame(() => {
    if (!mesh.current || !props.positionRef) { return; }
    mesh.current.position.set(...airTubePosition(
      config,
      props.positionRef.current,
    ));
  });
  return <Mesh ref={mesh}
    name={"air-tube"}
    castShadow={true}
    receiveShadow={true}
    position={airTubePosition(config, initialPosition)}
    geometry={geometry}>
    <MeshPhongMaterial color={"white"}
      transparent={true}
      opacity={0.75} />
  </Mesh>;
};

export const airTubePropsEqual = (
  prev: RoutingAssemblyProps,
  next: RoutingAssemblyProps,
) => prev.positionRef === next.positionRef &&
  prev.version.number === next.version.number &&
  prev.config.columnLength === next.config.columnLength &&
  prev.config.zGantryOffset === next.config.zGantryOffset &&
  prev.config.negativeZ === next.config.negativeZ &&
  (!!prev.positionRef || samePositionFields(
    prev,
    next,
    ["x", "y", "z"],
  ));

export const AirTube = React.memo(AirTubeBase, airTubePropsEqual);

const XRouting = React.memo((props: RoutingAssemblyProps) => {
  const { config, configPosition, version } = props;
  const { x } = configPosition;
  const xBeltPosition = (outerY: number, index: number) => {
    const bedColumnYOffset =
      (config.tracks ? 0 : EXTRUSION_WIDTH) * (index == 0 ? 1 : -1);
    return [
      -143,
      machineOuterY(config, outerY + 10 + bedColumnYOffset),
      0,
    ] as [number, number, number];
  };
  return <Group name={"x-routing"}>
    <XAxisBeltPair
      kitVersion={version.number}
      positions={[
        xBeltPosition(0 - EXTRUSION_WIDTH, 0),
        xBeltPosition(config.bedWidthOuter, 1),
      ]}
      length={config.botSizeX + 127 + X_TRACK_PADDING / 2}
      x={x}
      positionRef={props.positionRef}
      columnLength={config.columnLength} />
    {config.cableCarriers && <CableCarrierX
      config={config}
      configPosition={configPosition}
      positionRef={props.positionRef}
      local={true} />}
  </Group>;
}, xRoutingPropsEqual);

const YRouting = React.memo((props: RoutingAssemblyProps) => {
  const { config, configPosition, version } = props;
  const { x, y } = configPosition;
  return <Group name={"y-routing"}>
    <YAxisBelt
      beamLength={config.beamLength}
      botSizeY={config.botSizeY}
      kitVersion={version.number}
      y={y}
      positionRef={props.positionRef}
      position={[
        x - (version.number == "v1.9" ? 25 : 29),
        -100,
        config.columnLength + 99,
      ]} />
    {config.cableCarriers && <CableCarrierY
      config={config}
      configPosition={configPosition}
      positionRef={props.positionRef}
      local={true} />}
  </Group>;
}, yRoutingPropsEqual);

const ZRouting = React.memo((props: RoutingAssemblyProps) => {
  const { config, configPosition, version } = props;
  const { x, y, z } = configPosition;
  return <Group name={"z-routing"}>
    {version.zAxisBelt && <ZAxisBelt
      botSizeY={config.botSizeY}
      botSizeZ={config.botSizeZ}
      negativeZ={config.negativeZ}
      y={y}
      z={z}
      positionRef={props.positionRef}
      position={[x - 29, -100, config.columnLength + 99]} />}
    {config.cableCarriers && <CableCarrierZ
      config={config}
      configPosition={configPosition}
      positionRef={props.positionRef}
      local={true} />}
  </Group>;
}, zRoutingPropsEqual);

const FluidRouting = (props: RoutingAssemblyProps) => {
  const { config, configPosition } = props;
  return <Group name={"fluid-routing"}>
    <AirTube {...props} />
    <Solenoid
      config={config}
      configPosition={configPosition}
      frame={"machine"}
      renderBody={false} />
  </Group>;
};

export const RoutingAssembly = (props: RoutingAssemblyProps) => {
  usePerfRenderCount("BotRouting");
  return <Group name={"routing-systems"}>
    <PowerCable config={props.config} />
    <XRouting {...props} />
    <YRouting {...props} />
    <ZRouting {...props} />
    <FluidRouting {...props} />
  </Group>;
};
