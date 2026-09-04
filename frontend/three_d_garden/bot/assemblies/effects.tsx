import React from "react";
import * as THREE from "three";
import { Cylinder } from "@react-three/drei";
import { Config, PositionConfig } from "../../config";
import { zDir } from "../../helpers";
import { Group } from "../../components";
import { Bounds, CameraView } from "../components";
import { WateringAnimations } from "../components/watering_animations";
import {
  getBotKinematics, getCameraDistanceToSoil,
} from "../kinematics";
import { BotVersion } from "../bot_versions";
import { perfCount, usePerfRenderCount } from "../../../performance/perf";
import { ThreeDObjectSelectionHandler } from "../../selection_types";

export interface EffectsAssemblyProps {
  config: Config;
  configPosition: PositionConfig;
  version: BotVersion;
  getZ(x: number, y: number): number;
  onSelectObject?: ThreeDObjectSelectionHandler;
}

const useMeasuredGetZ = (getZRaw: EffectsAssemblyProps["getZ"]) =>
  React.useCallback((x: number, y: number) => {
    perfCount("bot.getZ");
    return getZRaw(x, y);
  }, [getZRaw]);

const CameraEffect = (props: EffectsAssemblyProps) => {
  const { config, configPosition, version, getZ: getZRaw } = props;
  const getZ = useMeasuredGetZ(getZRaw);
  const kinematics = getBotKinematics(config, configPosition, version);
  return <CameraView
    config={config}
    configPosition={configPosition}
    cameraMountPosition={new THREE.Vector3(
      ...kinematics.anchors.camera.worldPosition,
    )}
    distanceToSoil={getCameraDistanceToSoil(
      config,
      configPosition,
      getZ,
      kinematics,
    )}
    getZ={getZ} />;
};

const LaserEffect = (props: EffectsAssemblyProps) => {
  const { config, configPosition, version } = props;
  const getZ = useMeasuredGetZ(props.getZ);
  const kinematics = getBotKinematics(config, configPosition, version);
  const utmPosition = kinematics.anchors.utm.worldPosition;
  const distanceToSoil = -getZ(configPosition.x, configPosition.y) -
    zDir(config) * configPosition.z;
  return <Cylinder
    material-color={"red"}
    args={[5, 5, distanceToSoil]}
    position={[
      utmPosition[0],
      utmPosition[1],
      utmPosition[2] - distanceToSoil / 2,
    ]}
    rotation={[Math.PI / 2, 0, 0]} />;
};

const WaterEffect = (props: EffectsAssemblyProps) => {
  const getZ = useMeasuredGetZ(props.getZ);
  return <React.Suspense fallback={undefined}>
    <WateringAnimations
      waterFlow={props.config.waterFlow}
      config={props.config}
      configPosition={props.configPosition}
      getZ={getZ} />
  </React.Suspense>;
};

const cameraEffectActive = (config: Config) =>
  config.cameraView || !!config.lastImageCapture ||
  !!config.lastCameraOperation;

const activeEffects = (config: Config) => cameraEffectActive(config) ||
  config.laser || config.waterFlow || config.bounds || config.zDimension ||
  !!config.distanceIndicator;

const effectPositionDependencies = (
  config: Config,
  version: BotVersion,
): PositionConfig => {
  const indicator = config.distanceIndicator;
  const movingEffect = cameraEffectActive(config) ||
    config.laser || config.waterFlow;
  return {
    x: Number(movingEffect || indicator == "beamLength" ||
      indicator == "columnLength" || indicator == "zAxisLength"),
    y: Number(movingEffect || indicator == "zAxisLength"),
    z: Number(config.laser || config.zDimension ||
      indicator == "zAxisLength" ||
      version.number != "v1.9" &&
      (cameraEffectActive(config) || config.waterFlow)),
  };
};

const sameDependentPosition = (
  prev: PositionConfig,
  next: PositionConfig,
  dependencies: PositionConfig,
) => (!dependencies.x || prev.x === next.x) &&
  (!dependencies.y || prev.y === next.y) &&
  (!dependencies.z || prev.z === next.z);

export const effectsAssemblyPropsEqual = (
  prev: EffectsAssemblyProps,
  next: EffectsAssemblyProps,
) => {
  if (prev.config !== next.config || prev.getZ !== next.getZ ||
    prev.version.number !== next.version.number) {
    return false;
  }
  if (!activeEffects(prev.config) && !activeEffects(next.config)) {
    return true;
  }
  return sameDependentPosition(
    prev.configPosition,
    next.configPosition,
    effectPositionDependencies(prev.config, prev.version),
  );
};

const EffectsAssemblyBase = (props: EffectsAssemblyProps) => {
  usePerfRenderCount("BotEffects");
  const { config, configPosition } = props;
  return <Group name={"effects-and-diagnostics"}>
    {cameraEffectActive(config) && <CameraEffect {...props} />}
    {config.laser && <LaserEffect {...props} />}
    {config.waterFlow && <WaterEffect {...props} />}
    {(config.bounds || config.zDimension || !!config.distanceIndicator) &&
      <Bounds config={config} configPosition={configPosition}
        onSelectObject={props.onSelectObject} />}
  </Group>;
};

export const EffectsAssembly = React.memo(
  EffectsAssemblyBase,
  effectsAssemblyPropsEqual,
);
