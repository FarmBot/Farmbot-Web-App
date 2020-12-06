import React from "react";
import { Help } from "../../ui/index";
import { ToolTips, DeviceSetting } from "../../constants";
import { ToggleButton } from "../../ui/toggle_button";
import { updateConfig } from "../../devices/actions";
import { LogSettingProps, LogsSettingsMenuProps, Filters } from "../interfaces";
import { safeNumericSetting } from "../../session";
import { ConfigurationName } from "farmbot";
import { MessageType } from "../../sequences/interfaces";
import { t } from "../../i18next_wrapper";
import { Position } from "@blueprintjs/core";
import { DevSettings } from "../../settings/dev/dev_support";

interface LogSettingRecord {
  label: string;
  setting: ConfigurationName;
  tooltip: string;
}

const SEQUENCE_LOG_SETTINGS = (): LogSettingRecord[] => [
  {
    label: DeviceSetting.sequenceBeginLogs,
    setting: "sequence_init_log",
    tooltip: ToolTips.SEQUENCE_LOG_BEGIN
  },
  {
    label: DeviceSetting.sequenceStepLogs,
    setting: "sequence_body_log",
    tooltip: ToolTips.SEQUENCE_LOG_STEP
  },
  {
    label: DeviceSetting.sequenceCompleteLogs,
    setting: "sequence_complete_log",
    tooltip: ToolTips.SEQUENCE_LOG_END
  },
];

const FIRMWARE_LOG_SETTINGS = (): LogSettingRecord[] => [
  {
    label: DeviceSetting.firmwareSentLogs,
    setting: "firmware_output_log",
    tooltip: ToolTips.FIRMWARE_LOG_SENT
  },
  {
    label: DeviceSetting.firmwareReceivedLogs,
    setting: "firmware_input_log",
    tooltip: ToolTips.FIRMWARE_LOG_RECEIVED
  },
  {
    label: DeviceSetting.firmwareDebugLogs,
    setting: "arduino_debug_messages",
    tooltip: ToolTips.FIRMWARE_DEBUG_MESSAGES
  },
];

const LOG_SETTING_NAMES = SEQUENCE_LOG_SETTINGS().map(s => s.setting)
  .concat(FIRMWARE_LOG_SETTINGS().map(s => s.setting));

const LogSetting = (props: LogSettingProps) => {
  const { label, setting, toolTip, setFilterLevel, sourceFbosConfig } = props;
  /** Update the current filter level to a minimum needed for log display. */
  const updateMinFilterLevel = (key: keyof Filters, level: number) => {
    const currentLevel =
      props.getConfigValue(safeNumericSetting(key + "_log")) || 0;
    if (currentLevel < level) { setFilterLevel(key)(level); }
  };
  const config = sourceFbosConfig(setting);
  return <fieldset>
    <label>
      {t(label)}
    </label>
    <Help text={t(toolTip)} position={Position.LEFT_TOP} />
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
              updateMinFilterLevel(MessageType.debug, 3);
              break;
            case "sequence_init_log":
              updateMinFilterLevel(MessageType.busy, 2);
              break;
            case "sequence_body_log":
              updateMinFilterLevel(MessageType.info, 2);
              break;
            case "sequence_complete_log":
              updateMinFilterLevel(MessageType.success, 2);
              break;
          }
        }
      }} />
  </fieldset>;
};

export class LogsSettingsMenu extends React.Component<LogsSettingsMenuProps> {

  shouldComponentUpdate(nextProps: LogsSettingsMenuProps) {
    const data = (props: LogsSettingsMenuProps) =>
      JSON.stringify(LOG_SETTING_NAMES.map(s => props.sourceFbosConfig(s)));
    return data(nextProps) !== data(this.props);
  }

  render() {
    const { setFilterLevel, sourceFbosConfig, getConfigValue } = this.props;
    const LogSettingRow = (settingProps: LogSettingRecord) => {
      const { label, setting, tooltip } = settingProps;
      return <LogSetting
        label={label}
        setting={setting}
        toolTip={tooltip}
        setFilterLevel={setFilterLevel}
        dispatch={this.props.dispatch}
        sourceFbosConfig={sourceFbosConfig}
        getConfigValue={getConfigValue} />;
    };
    const { private_ip } = this.props.bot.hardware.informational_settings;
    return <div className={"logs-settings-menu"}>
      {t("Sequence logs:")}
      {SEQUENCE_LOG_SETTINGS().map(p => <LogSettingRow key={p.setting} {...p} />)}
      {t("Firmware logs:")}
      {FIRMWARE_LOG_SETTINGS().map(p => <LogSettingRow key={p.setting} {...p} />)}
      {DevSettings.futureFeaturesEnabled() && private_ip &&
        <div className={"log-stream-link"}>
          <a href={`http://${private_ip}/logger`}
            target={"_blank"} rel={"noreferrer"}>
            {t("debug log stream")}
            <i className="fa fa-external-link" />
          </a>
        </div>}
    </div>;
  }
}
