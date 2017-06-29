import * as React from "react";
import { VirtualFarmBot } from "../farmbot_position_point";
import { BotOriginQuadrant } from "../../interfaces";
import { BotState } from "../../../devices/interfaces";

interface FarmBotLayerProps {
  visible: boolean;
  botOriginQuadrant: BotOriginQuadrant;
  bot: BotState;
}

export function FarmBotLayer(props: FarmBotLayerProps) {
  let { visible, botOriginQuadrant } = props;
  return visible ? <g>
      <VirtualFarmBot
        quadrant={botOriginQuadrant}
        bot={props.bot}
      />
  </g> : <g />; // fallback
}
