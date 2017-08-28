import * as React from "react";
import { VirtualFarmBot } from "../farmbot_position_point";
import { BotOriginQuadrant } from "../../interfaces";
import { BotPosition } from "../../../devices/interfaces";

export interface FarmBotLayerProps {
  visible: boolean;
  botOriginQuadrant: BotOriginQuadrant;
  botPosition: BotPosition;
}

export function FarmBotLayer(props: FarmBotLayerProps) {
  const { visible, botOriginQuadrant } = props;
  return visible ? <g>
    <VirtualFarmBot
      quadrant={botOriginQuadrant}
      botPosition={props.botPosition} />
  </g> : <g />; // fallback
}
