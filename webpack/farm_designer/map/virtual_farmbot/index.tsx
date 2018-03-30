import * as React from "react";
import { VirtualFarmBotProps } from "../interfaces";
import { Session } from "../../../session";
import { BooleanSetting } from "../../../session_keys";
import { BotFigure } from "./bot_figure";
import { BotTrail } from "./bot_trail";
import { BotPeripherals } from "./bot_peripherals";
import { NegativePositionLabel } from "./negative_position_labels";

export function VirtualFarmBot(props: VirtualFarmBotProps) {
  const {
    mapTransformProps, plantAreaOffset, peripherals, eStopStatus
  } = props;
  const displayTrail = Session.deprecatedGetBool(BooleanSetting.display_trail);
  const encoderFigure = Session.deprecatedGetBool(BooleanSetting.encoder_figure);

  return <g id="virtual-farmbot">
    <NegativePositionLabel
      position={props.botLocationData.position}
      mapTransformProps={mapTransformProps}
      plantAreaOffset={plantAreaOffset} />
    <BotPeripherals
      position={props.botLocationData.position}
      mapTransformProps={mapTransformProps}
      plantAreaOffset={plantAreaOffset}
      peripherals={peripherals} />
    <BotFigure name={"motor-position"}
      position={props.botLocationData.position}
      mapTransformProps={mapTransformProps}
      plantAreaOffset={plantAreaOffset}
      eStopStatus={eStopStatus} />
    {encoderFigure &&
      <BotFigure name={"encoder-position"}
        position={props.botLocationData.scaled_encoders}
        mapTransformProps={mapTransformProps}
        plantAreaOffset={plantAreaOffset} />}
    {displayTrail &&
      <BotTrail
        position={props.botLocationData.position}
        mapTransformProps={mapTransformProps}
        peripherals={peripherals} />}
  </g>;
}
