import React from "react";
import { Position } from "@blueprintjs/core";
import { getStatus } from "../../connectivity/reducer_support";
import { isBotOnlineFromState, MustBeOnline } from "../../devices/must_be_online";
import { BooleanSetting } from "../../session_keys";
import { validBotLocationData } from "../../util";
import { MoveControlsProps } from "./interfaces";
import { BotPositionRows } from "./bot_position_rows";
import { JogControlsGroup } from "./jog_controls_group";
import { MotorPositionPlot } from "./motor_position_plot";
import { MoveWidgetSettingsMenu } from "./settings_menu";
import { Popover } from "../../ui";

export const MoveControls = (props: MoveControlsProps) => {
  const { location_data, informational_settings } = props.bot.hardware;
  const locationData = validBotLocationData(location_data);
  const botOnline = isBotOnlineFromState(props.bot);
  const { busy, locked } = props.bot.hardware.informational_settings;
  return <div className={"move"}>
    <Popover position={Position.LEFT_TOP} className={"move-settings"}
      target={<i className="fa fa-gear" />}
      content={<MoveWidgetSettingsMenu
        dispatch={props.dispatch}
        getConfigValue={props.getConfigValue}
        firmwareHardware={props.firmwareHardware} />} />
    <MustBeOnline
      networkState={getStatus(props.bot.connectivity.uptime["bot.mqtt"])}
      syncStatus={informational_settings.sync_status}>
      <JogControlsGroup
        dispatch={props.dispatch}
        stepSize={props.bot.stepSize}
        botPosition={locationData.position}
        getConfigValue={props.getConfigValue}
        arduinoBusy={busy}
        locked={locked}
        botOnline={true} // covered by MustBeOnline
        env={props.env}
        highlightAxis={props.highlightAxis}
        highlightDirection={props.highlightDirection}
        highlightHome={props.highlightHome}
        firmwareSettings={props.firmwareSettings} />
      <BotPositionRows
        locationData={locationData}
        getConfigValue={props.getConfigValue}
        arduinoBusy={busy}
        locked={locked}
        botOnline={botOnline}
        shouldDisplay={props.shouldDisplay}
        firmwareSettings={props.firmwareSettings}
        firmwareHardware={props.firmwareHardware} />
    </MustBeOnline>
    {props.getConfigValue(BooleanSetting.show_motor_plot) &&
      <MotorPositionPlot locationData={locationData} />}
  </div>;
};
