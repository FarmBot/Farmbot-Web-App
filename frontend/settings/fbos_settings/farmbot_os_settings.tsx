import React from "react";
import { Feature } from "../../devices/interfaces";
import { FarmbotSettingsProps } from "./interfaces";
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
import { OrderNumberRow } from "./order_number_row";
import { shouldDisplayFeature } from "../../devices/should_display";
import { GardenLocationRow } from "./garden_location_row";

export enum ColWidth {
  label = 3,
  description = 7,
  button = 2
}

export const FarmBotSettings = (props: FarmbotSettingsProps) => {
  const {
    dispatch, device, timeSettings, sourceFbosConfig, botOnline,
  } = props;
  const commonProps = { dispatch, device };
  return <Highlight className={"section"}
    settingName={DeviceSetting.farmbotSettings}>
    <Header {...commonProps}
      title={DeviceSetting.farmbotSettings}
      panel={"farmbot_settings"}
      dispatch={dispatch}
      expanded={props.settingsPanelState.farmbot_settings} />
    <Collapse isOpen={!!props.settingsPanelState.farmbot_settings}>
      <NameRow {...commonProps} />
      <OrderNumberRow {...commonProps} />
      <TimezoneRow {...commonProps} />
      <GardenLocationRow {...commonProps} />
      <OtaTimeSelectorRow {...commonProps}
        timeSettings={timeSettings}
        sourceFbosConfig={sourceFbosConfig} />
      <AutoUpdateRow {...commonProps}
        sourceFbosConfig={sourceFbosConfig} />
      <FarmbotOsRow {...commonProps}
        bot={props.bot}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline}
        timeSettings={timeSettings} />
      {shouldDisplayFeature(Feature.boot_sequence) && <BootSequenceSelector />}
    </Collapse>
  </Highlight>;
};
