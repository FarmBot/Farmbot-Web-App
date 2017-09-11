import * as React from "react";
import { VirtualFarmBot } from "../virtual_farmbot";
import { BotExtents } from "../bot_extents";
import { FarmBotLayerProps } from "../interfaces";

export function FarmBotLayer(props: FarmBotLayerProps) {
  const {
    visible, stopAtHome, botSize, plantAreaOffset, mapTransformProps
   } = props;
  return visible ? <g>
    <VirtualFarmBot
      mapTransformProps={mapTransformProps}
      botPosition={props.botPosition}
      plantAreaOffset={plantAreaOffset} />
    <BotExtents
      mapTransformProps={mapTransformProps}
      stopAtHome={stopAtHome}
      botSize={botSize} />
  </g> : <g />; // fallback
}
