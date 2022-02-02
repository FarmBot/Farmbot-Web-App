import React from "react";
import { Color } from "../../ui";
import { SourceFwConfig } from "../../devices/interfaces";
import type { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import type { McuParamName, FirmwareHardware } from "farmbot";
import { isTMCBoard } from "../firmware/firmware_hardware_support";
import { t } from "../../i18next_wrapper";

export interface SettingLoadProgressProps {
  botOnline: boolean;
  sourceFwConfig: SourceFwConfig;
  firmwareConfig: FirmwareConfig | undefined;
  firmwareHardware: FirmwareHardware | undefined;
}

const UNTRACKED_KEYS: (keyof FirmwareConfig)[] = [
  "id", "created_at", "updated_at", "device_id",
  "param_config_ok", "param_test", "param_use_eeprom", "param_version",
];

const TMC_KEYS: (keyof FirmwareConfig)[] = [
  "movement_stall_sensitivity_x",
  "movement_stall_sensitivity_y",
  "movement_stall_sensitivity_z",
  "movement_motor_current_x",
  "movement_motor_current_y",
  "movement_motor_current_z",
  "movement_microsteps_x",
  "movement_microsteps_y",
  "movement_microsteps_z",
  "movement_axis_stealth_x",
  "movement_axis_stealth_y",
  "movement_axis_stealth_z",
];

const REPORT_KEYS: (keyof FirmwareConfig)[] = [
  "pin_report_1_pin_nr",
  "pin_report_2_pin_nr",
];

/** Track firmware configuration adoption by FarmBot OS. */
export const SettingLoadProgress = (props: SettingLoadProgressProps) => {
  const { firmwareHardware } = props;
  const keys = Object.keys(props.firmwareConfig || {})
    .filter((k: keyof FirmwareConfig) => !UNTRACKED_KEYS
      .concat(isTMCBoard(firmwareHardware) ? [] : TMC_KEYS)
      .concat(REPORT_KEYS)
      .includes(k));
  const loadedKeys = keys.filter((key: McuParamName) =>
    props.sourceFwConfig(key).consistent);
  const progress = Math.round(loadedKeys.length / keys.length * 100);
  const color = [0, 100].includes(progress) ? Color.darkGray : Color.white;
  return <div className={"load-progress-bar-wrapper"}
    onClick={() => console.log(keys.filter((key: McuParamName) =>
      !props.sourceFwConfig(key).consistent))}>
    <div className={"load-progress-bar"}
      style={{ width: `${progress}%`, background: color }}>
      {props.botOnline
        ? <p>{`${progress}%`}</p>
        : <p>{`0% (${t("offline")})`}</p>}
    </div>
  </div>;
};
