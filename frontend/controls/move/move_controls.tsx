import React from "react";
import { Position } from "@blueprintjs/core";
import { getStatus } from "../../connectivity/reducer_support";
import { isBotOnline, isBotOnlineFromState } from "../../devices/must_be_online";
import { BooleanSetting } from "../../session_keys";
import { validBotLocationData } from "../../util/location";
import { MoveControlsProps } from "./interfaces";
import { BotPositionRows } from "./bot_position_rows";
import { JogControlsGroup } from "./jog_controls_group";
import { MotorPositionPlot } from "./motor_position_plot";
import { MoveWidgetSettingsMenu } from "./settings_menu";
import { Popover } from "../../ui";
import { getImageJobs } from "../../photos/state_to_props";
import { hasEncoders } from "../../settings/firmware/firmware_hardware_support";

export const MoveControls = (props: MoveControlsProps) => {
  const { location_data, informational_settings } = props.bot.hardware;
  const locationData = validBotLocationData(location_data);
  const botOnline = isBotOnlineFromState(props.bot);
  const { busy, locked } = props.bot.hardware.informational_settings;
  return <div className={"move grid double-gap"}>
    <Popover position={Position.LEFT_TOP} className={"move-settings"}
      target={<i className={"fa fa-gear fb-icon-button invert"} />}
      content={<MoveWidgetSettingsMenu
        dispatch={props.dispatch}
        getConfigValue={props.getConfigValue}
        firmwareHardware={props.firmwareHardware} />} />
    <JogControlsGroup
      dispatch={props.dispatch}
      stepSize={props.bot.stepSize}
      botPosition={locationData.position}
      getConfigValue={props.getConfigValue}
      arduinoBusy={busy}
      locked={locked}
      botOnline={isBotOnline(
        informational_settings.sync_status,
        getStatus(props.bot.connectivity.uptime["bot.mqtt"]))}
      env={props.env}
      imageJobs={getImageJobs(props.bot.hardware.jobs)}
      logs={props.logs}
      highlightAxis={props.highlightAxis}
      highlightDirection={props.highlightDirection}
      highlightHome={props.highlightHome}
      movementState={props.movementState}
      firmwareSettings={props.firmwareSettings} />
    <BotPositionRows
      locationData={locationData}
      getConfigValue={props.getConfigValue}
      arduinoBusy={busy}
      locked={locked}
      botOnline={botOnline}
      dispatch={props.dispatch}
      firmwareSettings={props.firmwareSettings}
      sourceFwConfig={props.sourceFwConfig}
      firmwareHardware={props.firmwareHardware} />
    {props.getConfigValue(BooleanSetting.show_motor_plot) &&
      <MotorPositionPlot locationData={locationData}
        encoders={hasEncoders(props.firmwareHardware)} />}
    {props.getConfigValue(BooleanSetting.show_missed_step_plot) &&
      !hasEncoders(props.firmwareHardware) &&
      <MotorPositionPlot locationData={locationData} load={true}
        firmwareSettings={props.firmwareSettings} />}
  </div>;
};
