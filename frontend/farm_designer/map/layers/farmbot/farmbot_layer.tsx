import React from "react";
import { VirtualFarmBot } from "./index";
import { BotExtents } from "./bot_extents";
import { FarmBotLayerProps } from "../../interfaces";

export function FarmBotLayer(props: FarmBotLayerProps) {
  const {
    visible, stopAtHome, botSize, plantAreaOffset, mapTransformProps,
    peripheralValues, eStopStatus, botLocationData, getConfigValue,
  } = props;
  return visible
    ? <g id="farmbot-layer" style={{ pointerEvents: "none" }}>
      <VirtualFarmBot
        mapTransformProps={mapTransformProps}
        botLocationData={botLocationData}
        plantAreaOffset={plantAreaOffset}
        peripheralValues={peripheralValues}
        eStopStatus={eStopStatus}
        mountedToolInfo={props.mountedToolInfo}
        cameraCalibrationData={props.cameraCalibrationData}
        getConfigValue={getConfigValue} />
      <BotExtents
        mapTransformProps={mapTransformProps}
        stopAtHome={stopAtHome}
        botSize={botSize} />
    </g>
    : <g id="farmbot-layer" />;
}
