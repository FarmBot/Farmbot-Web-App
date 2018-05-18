import * as React from "react";
import { t } from "i18next";
import { Help } from "../../ui/index";
import { ToolTips } from "../../constants";
import { ToggleButton } from "../../controls/toggle_button";
import { updateConfig } from "../../devices/actions";
import { LogSettingProps, LogsSettingsMenuProps, Filters } from "../interfaces";
import { Session, safeNumericSetting } from "../../session";
import { ConfigurationName } from "farmbot";

interface LogSettingRecord {
  label: string;
  setting: ConfigurationName;
  tooltip: string;
}

const SEQUENCE_LOG_SETTINGS = (): LogSettingRecord[] => [
  {
    label: t("Begin"),
    setting: "sequence_init_log",
    tooltip: ToolTips.SEQUENCE_LOG_BEGIN
  },
  {
    label: t("Steps"),
    setting: "sequence_body_log",
    tooltip: ToolTips.SEQUENCE_LOG_STEP
  },
  {
    label: t("Complete"),
    setting: "sequence_complete_log",
    tooltip: ToolTips.SEQUENCE_LOG_END
  }
];

const FIRMWARE_LOG_SETTINGS = (): LogSettingRecord[] => [
  {
    label: t("Sent"),
    setting: "firmware_output_log",
    tooltip: ToolTips.FIRMWARE_LOG_SENT
  },
  {
    label: t("Received"),
    setting: "firmware_input_log",
    tooltip: ToolTips.FIRMWARE_LOG_RECEIVED
  },
  {
    label: t("Debug"),
    setting: "arduino_debug_messages",
    tooltip: ToolTips.FIRMWARE_DEBUG_MESSAGES
  },
];

const LogSetting = (props: LogSettingProps) => {
  const { label, setting, toolTip, setFilterLevel, sourceFbosConfig } = props;
  /** Update the current filter level to a minimum needed for log display. */
  const updateMinFilterLevel = (name: keyof Filters, level: number) => {
    const currentLevel =
      Session.deprecatedGetNum(safeNumericSetting(name + "_log")) || 0;
    if (currentLevel < level) { setFilterLevel(name)(level); }
  };
  const config = sourceFbosConfig(setting);
  return <fieldset>
    <label>
      {t(label)}
    </label>
    <Help text={t(toolTip)} />
    <ToggleButton
      toggleValue={config.value}
      dim={!config.consistent}
      toggleAction={() => {
        props.dispatch(updateConfig({ [setting]: !config.value }));
        if (!config.value === true) {
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
  const { setFilterLevel, sourceFbosConfig } = props;
  const LogSettingRow = (settingProps: LogSettingRecord) => {
    const { label, setting, tooltip } = settingProps;
    return <LogSetting
      label={label}
      setting={setting}
      toolTip={tooltip}
      setFilterLevel={setFilterLevel}
      dispatch={props.dispatch}
      sourceFbosConfig={sourceFbosConfig} />;
  };
  return <div className={"logs-settings-menu"}>
    {t("Create logs for sequence:")}
    {SEQUENCE_LOG_SETTINGS().map(p => <LogSettingRow key={p.setting} {...p} />)}
    {t("Firmware Logs:")}
    {FIRMWARE_LOG_SETTINGS().map(p => <LogSettingRow key={p.setting} {...p} />)}
  </div>;
};
