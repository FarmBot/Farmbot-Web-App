import * as React from "react";
import { VirtualFarmBot } from "../virtual_farmbot/index";
import { BotExtents } from "../bot_extents";
import { FarmBotLayerProps } from "../interfaces";

export function FarmBotLayer(props: FarmBotLayerProps) {
  const {
    visible, stopAtHome, botSize, plantAreaOffset, mapTransformProps,
    peripherals, eStopStatus, botLocationData
  } = props;
  return visible ? <g id="farmbot-layer">
    <VirtualFarmBot
      mapTransformProps={mapTransformProps}
      botLocationData={botLocationData}
      plantAreaOffset={plantAreaOffset}
      peripherals={peripherals}
      eStopStatus={eStopStatus} />
    <BotExtents
      mapTransformProps={mapTransformProps}
      stopAtHome={stopAtHome}
      botSize={botSize} />
  </g> : <g id="farmbot-layer" />;
}
