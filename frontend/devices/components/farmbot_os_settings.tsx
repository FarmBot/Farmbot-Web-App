import * as React from "react";
import { Feature, FarmbotSettingsProps } from "../interfaces";
import { CameraSelection } from "./fbos_settings/camera_selection";
import { FarmbotOsRow } from "./fbos_settings/farmbot_os_row";
import { AutoUpdateRow } from "./fbos_settings/auto_update_row";
import { AutoSyncRow } from "./fbos_settings/auto_sync_row";
import { BootSequenceSelector } from "./fbos_settings/boot_sequence_selector";
import { OtaTimeSelectorRow } from "./fbos_settings/ota_time_selector";
import { NameRow } from "./fbos_settings/name_row";
import { TimezoneRow } from "./fbos_settings/timezone_row";
import { Highlight } from "./maybe_highlight";
import { Header } from "./hardware_settings/header";
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
      <CameraSelection {...commonProps}
        env={props.env}
        botOnline={botOnline}
        saveFarmwareEnv={props.saveFarmwareEnv}
        shouldDisplay={shouldDisplay} />
      <OtaTimeSelectorRow {...commonProps}
        timeSettings={timeSettings}
        device={device}
        sourceFbosConfig={sourceFbosConfig} />
      <AutoUpdateRow {...commonProps}
        sourceFbosConfig={sourceFbosConfig} />
      <FarmbotOsRow {...commonProps}
        bot={props.bot}
        sourceFbosConfig={sourceFbosConfig}
        shouldDisplay={shouldDisplay}
        botOnline={botOnline}
        timeSettings={timeSettings}
        deviceAccount={device} />
      <AutoSyncRow {...commonProps}
        sourceFbosConfig={sourceFbosConfig} />
      {shouldDisplay(Feature.boot_sequence) && <BootSequenceSelector />}
    </Collapse>
  </Highlight>;
};
