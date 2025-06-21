import React from "react";
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
import { GardenLocationRow } from "./garden_location_row";
import { BoardType } from "../firmware/board_type";
import { FirmwarePathRow } from "../firmware/firmware_path";
import { validFirmwareHardware } from "../firmware/firmware_hardware_support";
import { RpiModel } from "./rpi_model";

export const FarmBotSettings = (props: FarmbotSettingsProps) => {
  const {
    dispatch, device, timeSettings, sourceFbosConfig, botOnline, showAdvanced, bot,
  } = props;
  const { value } = props.sourceFbosConfig("firmware_hardware");
  const firmwareHardware = validFirmwareHardware(value);
  const commonProps = { dispatch, device, showAdvanced, sourceFbosConfig, bot };
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
      <GardenLocationRow {...commonProps} farmwareEnvs={props.farmwareEnvs} />
      <OtaTimeSelectorRow {...commonProps}
        timeSettings={timeSettings} />
      <AutoUpdateRow {...commonProps} />
      <FarmbotOsRow {...commonProps}
        botOnline={botOnline}
        timeSettings={timeSettings} />
      <BootSequenceSelector />
      <BoardType {...commonProps}
        botOnline={botOnline}
        alerts={props.alerts}
        timeSettings={props.timeSettings}
        firmwareHardware={firmwareHardware} />
      <FirmwarePathRow {...commonProps}
        firmwarePath={"" + sourceFbosConfig("firmware_path").value} />
      <RpiModel {...commonProps}
        firmwareHardware={firmwareHardware} />
    </Collapse>
  </Highlight>;
};
