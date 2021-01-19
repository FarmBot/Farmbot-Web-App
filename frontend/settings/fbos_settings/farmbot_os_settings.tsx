import React from "react";
import { Feature, FarmbotSettingsProps } from "../../devices/interfaces";
import { FarmbotOsRow } from "./farmbot_os_row";
import { AutoUpdateRow } from "./auto_update_row";
import { BootSequenceSelector } from "./boot_sequence_selector";
import { OtaTimeSelectorRow } from "./ota_time_selector";
import { NameRow } from "./name_row";
import { TimezoneRow } from "./timezone_row";
import { Highlight } from "../maybe_highlight";
import { Header } from "../hardware_settings/header";
import { DeviceSetting } from "../../constants";
import { Collapse } from "@blueprintjs/core";

export enum ColWidth {
  label = 3,
  description = 7,
  button = 2
}

export const FarmBotSettings = (props: FarmbotSettingsProps) => {
  const {
    dispatch, device, shouldDisplay, timeSettings, sourceFbosConfig,
    botOnline,
  } = props;
  const commonProps = { dispatch };
  return <Highlight className={"section"}
    settingName={DeviceSetting.farmbotSettings}>
    <Header {...commonProps}
      title={DeviceSetting.farmbotSettings}
      panel={"farmbot_settings"}
      dispatch={dispatch}
      expanded={props.bot.controlPanelState.farmbot_settings} />
    <Collapse isOpen={!!props.bot.controlPanelState.farmbot_settings}>
      <NameRow {...commonProps} device={device} />
      <TimezoneRow {...commonProps} device={device} />
      <OtaTimeSelectorRow {...commonProps}
        timeSettings={timeSettings}
        device={device}
        sourceFbosConfig={sourceFbosConfig} />
      <AutoUpdateRow {...commonProps}
        sourceFbosConfig={sourceFbosConfig} />
      <FarmbotOsRow {...commonProps}
        bot={props.bot}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline}
        timeSettings={timeSettings}
        deviceAccount={device} />
      {shouldDisplay(Feature.boot_sequence) && <BootSequenceSelector />}
    </Collapse>
  </Highlight>;
};
