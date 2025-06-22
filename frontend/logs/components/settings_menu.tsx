import React from "react";
import { Help, ToggleButton } from "../../ui";
import { ToolTips, DeviceSetting, Content } from "../../constants";
import { updateConfig } from "../../devices/actions";
import { LogSettingProps, LogsSettingsMenuProps, Filters } from "../interfaces";
import { safeNumericSetting } from "../../session";
import { ConfigurationName } from "farmbot";
import { MessageType } from "../../sequences/interfaces";
import { t } from "../../i18next_wrapper";
import { Position } from "@blueprintjs/core";
import { DevSettings } from "../../settings/dev/dev_support";
import { getModifiedClassName } from "../../settings/fbos_settings/default_values";
import { getModifiedClassNameSpecifyDefault } from "../../settings/default_values";
import { destroyAll } from "../../api/crud";
import {
  validFirmwareHardware,
} from "../../settings/firmware/firmware_hardware_support";

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

const LOG_SETTING_NAMES = SEQUENCE_LOG_SETTINGS().map(s => s.setting);

const LogSetting = (props: LogSettingProps) => {
  const { label, setting, toolTip, setFilterLevel, sourceFbosConfig } = props;
  /** Update the current filter level to a minimum needed for log display. */
  const updateMinFilterLevel = (key: keyof Filters, level: number) => {
    const currentLevel =
      props.getConfigValue(safeNumericSetting(key + "_log")) || 0;
    if (+currentLevel < level) { setFilterLevel(key)(level); }
  };
  const config = sourceFbosConfig(setting);
  const firmwareHardware = validFirmwareHardware(
    sourceFbosConfig("firmware_hardware").value);
  return <fieldset>
    <label>
      {t(label)}
    </label>
    <Help text={t(toolTip)} position={Position.LEFT_TOP} />
    <ToggleButton
      toggleValue={config.value}
      dim={!config.consistent}
      className={getModifiedClassName(setting, config.value, firmwareHardware)}
      toggleAction={() => {
        const newValue = !config.value;
        props.dispatch(updateConfig({ [setting]: newValue }));
        if (newValue === true) {
          switch (setting) {
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
      JSON.stringify(LOG_SETTING_NAMES.map(s => props.sourceFbosConfig(s)))
      + props.markdown;
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
      <fieldset>
        <label>
          {t("Display raw")}
        </label>
        <ToggleButton
          toggleValue={!this.props.markdown}
          className={getModifiedClassNameSpecifyDefault(this.props.markdown, true)}
          toggleAction={this.props.toggleMarkdown} />
      </fieldset>
      {t("Sequence logs:")}
      {SEQUENCE_LOG_SETTINGS().map(p => <LogSettingRow key={p.setting} {...p} />)}
      {DevSettings.futureFeaturesEnabled() && private_ip &&
        <div className={"log-stream-link"}>
          <a href={`http://${private_ip}/logger`}
            target={"_blank"} rel={"noreferrer"}>
            {t("debug log stream")}
            <i className="fa fa-external-link" />
          </a>
        </div>}
      <fieldset className={"delete-all"}>
        <button className={"fb-button red"}
          onClick={() => {
            this.props.dispatch(destroyAll("Log", false,
              t(Content.DELETE_ALL_LOGS_CONFIRMATION)))
              .then(() => location.assign(window.location.origin));
          }}>
          {t("Delete all logs")}
        </button>
      </fieldset>
    </div>;
  }
}
