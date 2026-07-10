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

export interface EffectsAssemblyProps {
  config: Config;
  configPosition: PositionConfig;
  version: BotVersion;
  getZ(x: number, y: number): number;
}

export const EffectsAssembly = (props: EffectsAssemblyProps) => {
  const { config, configPosition, getZ, version } = props;
  const kinematics = getBotKinematics(config, configPosition, version);
  const utmPosition = kinematics.anchors.utm.worldPosition;
  const distanceToSoil = -getZ(configPosition.x, configPosition.y) -
    zDir(config) * configPosition.z;
  return <Group name={"effects-and-diagnostics"}>
    <CameraView
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
      )} />
    <Cylinder
      visible={config.laser}
      material-color={"red"}
      args={[5, 5, distanceToSoil]}
      position={[
        utmPosition[0],
        utmPosition[1],
        utmPosition[2] - distanceToSoil / 2,
      ]}
      rotation={[Math.PI / 2, 0, 0]} />
    {config.waterFlow && <React.Suspense fallback={undefined}>
      <WateringAnimations
        waterFlow={config.waterFlow}
        config={config}
        configPosition={configPosition}
        getZ={getZ} />
    </React.Suspense>}
    {(config.bounds || config.zDimension || !!config.distanceIndicator) &&
      <Bounds config={config} configPosition={configPosition} />}
  </Group>;
};
