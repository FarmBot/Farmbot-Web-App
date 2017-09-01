import * as React from "react";
import { VirtualFarmBot } from "../virtual_farmbot";
import { BotExtents } from "../bot_extents";
import { BotOriginQuadrant } from "../../interfaces";
import { BotPosition, StepsPerMmXY } from "../../../devices/interfaces";
import { McuParams } from "farmbot/dist";

export interface FarmBotLayerProps {
  visible: boolean;
  botOriginQuadrant: BotOriginQuadrant;
  botPosition: BotPosition;
  botMcuParams: McuParams;
  stepsPerMmXY: StepsPerMmXY;
}

export function FarmBotLayer(props: FarmBotLayerProps) {
  const { visible, botOriginQuadrant, botMcuParams, stepsPerMmXY } = props;
  return visible ? <g>
    <VirtualFarmBot
      quadrant={botOriginQuadrant}
      botPosition={props.botPosition} />
    <BotExtents
      quadrant={botOriginQuadrant}
      botMcuParams={botMcuParams}
      stepsPerMmXY={stepsPerMmXY} />
  </g> : <g />; // fallback
}
