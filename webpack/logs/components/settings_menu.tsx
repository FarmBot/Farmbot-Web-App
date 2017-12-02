import * as React from "react";
import { t } from "i18next";
import { BotState } from "../../devices/interfaces";
import { Help } from "../../ui/index";
import { ToolTips } from "../../constants";
import { ToggleButton } from "../../controls/toggle_button";
import { updateConfig } from "../../devices/actions";
import { noop } from "lodash";
import { LogSettingProps } from "../interfaces";

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
  const {
    sequence_init_log, sequence_body_log, sequence_complete_log
  } = bot.hardware.configuration;
  return <div className={"logs-settings-menu"}>
    {t("Create logs for sequence:")}
    <LogSetting
      label={"Begin"}
      setting={"sequence_init_log"}
      toolTip={ToolTips.SEQUENCE_LOG_BEGIN}
      value={sequence_init_log} />
    <LogSetting
      label={"Steps"}
      setting={"sequence_body_log"}
      toolTip={ToolTips.SEQUENCE_LOG_STEP}
      value={sequence_body_log} />
    <LogSetting
      label={"Complete"}
      setting={"sequence_complete_log"}
      toolTip={ToolTips.SEQUENCE_LOG_END}
      value={sequence_complete_log} />
  </div>;
};
