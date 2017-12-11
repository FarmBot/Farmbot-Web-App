import * as React from "react";
import { t } from "i18next";
import { BotState } from "../../devices/interfaces";
import { Help } from "../../ui/index";
import { ToolTips } from "../../constants";
import { ToggleButton } from "../../controls/toggle_button";
import { updateConfig } from "../../devices/actions";
import { noop } from "lodash";
import { LogSettingProps } from "../interfaces";
import { ConfigurationName } from "farmbot";

const LogSetting = (props: LogSettingProps) => {
  const { label, setting, toolTip, value } = props;
  return <fieldset>
    <label>
      {t(label)}
    </label>
    <Help text={t(toolTip)} />
    <ToggleButton toggleValue={value}
      toggleAction={() => {
        updateConfig({ [setting]: !value })(noop);
      }} />
  </fieldset>;
};

export const LogsSettingsMenu = (bot: BotState) => {
  const { configuration } = bot.hardware;
  return <div className={"logs-settings-menu"}>
    {t("Create logs for sequence:")}
    <LogSetting
      label={"Begin"}
      setting={"sequence_init_log"}
      toolTip={ToolTips.SEQUENCE_LOG_BEGIN}
      value={configuration.sequence_init_log} />
    <LogSetting
      label={"Steps"}
      setting={"sequence_body_log"}
      toolTip={ToolTips.SEQUENCE_LOG_STEP}
      value={configuration.sequence_body_log} />
    <LogSetting
      label={"Complete"}
      setting={"sequence_complete_log"}
      toolTip={ToolTips.SEQUENCE_LOG_END}
      value={configuration.sequence_complete_log} />
    {t("Firmware Logs:")}
    {/*
      // TODO: remove type assertions when names are added to farmbot-js
    */}
    <LogSetting
      label={"Sent"}
      setting={"firmware_output_log" as ConfigurationName}
      toolTip={ToolTips.FIRMWARE_LOG_SENT}
      value={!!configuration["firmware_output_log" as ConfigurationName]} />
    <LogSetting
      label={"Received"}
      setting={"firmware_input_log" as ConfigurationName}
      toolTip={ToolTips.FIRMWARE_LOG_RECEIVED}
      value={!!configuration["firmware_input_log" as ConfigurationName]} />
  </div>;
};
