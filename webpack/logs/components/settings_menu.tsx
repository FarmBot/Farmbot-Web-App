import * as React from "react";
import { t } from "i18next";
import { Help } from "../../ui/index";
import { ToolTips } from "../../constants";
import { ToggleButton } from "../../controls/toggle_button";
import { updateConfig } from "../../devices/actions";
import { noop } from "lodash";
import {
  LogSettingProps, LogsSettingsMenuProps, LogsState
} from "../interfaces";
import { Session, safeNumericSetting } from "../../session";

const LogSetting = (props: LogSettingProps) => {
  const { label, setting, toolTip, value, setFilterLevel } = props;
  const updateMinFilterLevel = (name: keyof LogsState, level: number) => {
    const currentLevel = Session.getNum(safeNumericSetting(name + "Log")) || 0;
    if (currentLevel < level) { setFilterLevel(name)(level); }
  };
  return <fieldset>
    <label>
      {t(label)}
    </label>
    <Help text={t(toolTip)} />
    <ToggleButton toggleValue={value}
      toggleAction={() => {
        updateConfig({ [setting]: !value })(noop);
        if (!value === true) {
          switch (setting) {
            case "firmware_output_log":
            case "firmware_input_log":
            case "arduino_debug_messages":
              updateMinFilterLevel("debug", 3);
              break;
            case "sequence_init_log":
              updateMinFilterLevel("busy", 2);
              break;
            case "sequence_body_log":
              updateMinFilterLevel("info", 2);
              break;
            case "sequence_complete_log":
              updateMinFilterLevel("success", 2);
              break;
          }
        }
      }} />
  </fieldset>;
};

export const LogsSettingsMenu = (props: LogsSettingsMenuProps) => {
  const { bot, setFilterLevel } = props;
  const { configuration } = bot.hardware;
  return <div className={"logs-settings-menu"}>
    {t("Create logs for sequence:")}
    <LogSetting
      label={"Begin"}
      setting={"sequence_init_log"}
      toolTip={ToolTips.SEQUENCE_LOG_BEGIN}
      value={configuration.sequence_init_log}
      setFilterLevel={setFilterLevel} />
    <LogSetting
      label={"Steps"}
      setting={"sequence_body_log"}
      toolTip={ToolTips.SEQUENCE_LOG_STEP}
      value={configuration.sequence_body_log}
      setFilterLevel={setFilterLevel} />
    <LogSetting
      label={"Complete"}
      setting={"sequence_complete_log"}
      toolTip={ToolTips.SEQUENCE_LOG_END}
      value={configuration.sequence_complete_log}
      setFilterLevel={setFilterLevel} />
    {t("Firmware Logs:")}
    <LogSetting
      label={"Sent"}
      setting={"firmware_output_log"}
      toolTip={ToolTips.FIRMWARE_LOG_SENT}
      value={configuration.firmware_output_log}
      setFilterLevel={setFilterLevel} />
    <LogSetting
      label={"Received"}
      setting={"firmware_input_log"}
      toolTip={ToolTips.FIRMWARE_LOG_RECEIVED}
      value={configuration.firmware_input_log}
      setFilterLevel={setFilterLevel} />
    <LogSetting
      label={"Debug"}
      setting={"arduino_debug_messages"}
      toolTip={ToolTips.FIRMWARE_DEBUG_MESSAGES}
      value={!!configuration["arduino_debug_messages"]}
      setFilterLevel={setFilterLevel} />
  </div>;
};
