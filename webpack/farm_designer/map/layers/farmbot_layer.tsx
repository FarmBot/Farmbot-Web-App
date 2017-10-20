import * as React from "react";
import { VirtualFarmBot } from "../virtual_farmbot";
import { BotExtents } from "../bot_extents";
import { FarmBotLayerProps } from "../interfaces";

export function FarmBotLayer(props: FarmBotLayerProps) {
  const {
    visible, stopAtHome, botSize, plantAreaOffset, mapTransformProps
   } = props;
  return visible ? <g id="farmbot-layer">
    <VirtualFarmBot
      mapTransformProps={mapTransformProps}
      botLocationData={props.botLocationData}
      plantAreaOffset={plantAreaOffset} />
    <BotExtents
      mapTransformProps={mapTransformProps}
      stopAtHome={stopAtHome}
      botSize={botSize} />
  </g> : <g id="farmbot-layer" />;
}
