import React from "react";
import { Tube } from "@react-three/drei";
import { Config, PositionConfig } from "../../config";
import { easyCubicBezierCurve3, zDir, zZero } from "../../helpers";
import { Group, MeshPhongMaterial } from "../../components";
import {
  CableCarrierX, CableCarrierY, CableCarrierZ, PowerCable, Solenoid,
} from "../components";
import { XAxisBelt, YAxisBelt, ZAxisBelt } from "../belts";
import { BotVersion } from "../bot_versions";
import {
  EXTRUSION_WIDTH, X_TRACK_PADDING, machineOuterY,
} from "./constants";

export interface RoutingAssemblyProps {
  config: Config;
  configPosition: PositionConfig;
  version: BotVersion;
}

const airTubeEndPosition = (
  version: BotVersion,
  position: PositionConfig,
  utmZ: number,
): [number, number, number] => {
  switch (version.number) {
    case "v1.7":
      return [position.x + 69, position.y + 100, utmZ + 245];
    case "v1.8":
      return [position.x + 24, position.y, utmZ + 245];
    case "v1.9":
      return [position.x + 24, position.y + 20, utmZ + 245];
  }
};

export const RoutingAssembly = (props: RoutingAssemblyProps) => {
  const { config, configPosition, version } = props;
  const { x, y, z } = configPosition;
  const utmZ = zZero(config) - zDir(config) * z;
  return <Group name={"routing-systems"}>
    <PowerCable config={config} />
    {[0 - EXTRUSION_WIDTH, config.bedWidthOuter].map((outerY, index) => {
      const bedColumnYOffset =
        (config.tracks ? 0 : EXTRUSION_WIDTH) * (index == 0 ? 1 : -1);
      return <XAxisBelt
        key={outerY}
        name={index == 0 ? "x1Belt" : "x2Belt"}
        kitVersion={version.number}
        position={[
          -143,
          machineOuterY(config, outerY + 10 + bedColumnYOffset),
          0,
        ]}
        length={config.botSizeX + 127 + X_TRACK_PADDING / 2}
        x={x}
        columnLength={config.columnLength} />;
    })}
    <YAxisBelt
      beamLength={config.beamLength}
      botSizeY={config.botSizeY}
      kitVersion={version.number}
      y={y}
      position={[
        x - (version.number == "v1.9" ? 25 : 29),
        -100,
        config.columnLength + 99,
      ]} />
    {version.zAxisBelt && <ZAxisBelt
      botSizeY={config.botSizeY}
      botSizeZ={config.botSizeZ}
      negativeZ={config.negativeZ}
      y={y}
      z={z}
      position={[x - 29, -100, config.columnLength + 99]} />}
    {config.cableCarriers && <>
      <CableCarrierX
        config={config}
        configPosition={configPosition}
        local={true} />
      <CableCarrierY
        config={config}
        configPosition={configPosition}
        local={true} />
      <CableCarrierZ
        config={config}
        configPosition={configPosition}
        local={true} />
    </>}
    <Tube name={"air-tube"}
      castShadow={true}
      receiveShadow={true}
      args={[easyCubicBezierCurve3(
        [x + 17, y, utmZ + 35],
        [0, 0, 100],
        [0, 0, -200],
        airTubeEndPosition(version, configPosition, utmZ),
      ), 20, 5, 8]}>
      <MeshPhongMaterial color={"white"}
        transparent={true}
        opacity={0.75} />
    </Tube>
    <Solenoid
      config={config}
      configPosition={configPosition}
      frame={"machine"}
      renderBody={false} />
  </Group>;
};
