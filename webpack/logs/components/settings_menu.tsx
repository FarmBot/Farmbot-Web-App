import * as React from "react";
import { t } from "i18next";
import { BotState } from "../../devices/interfaces";
import { Help } from "../../ui/index";
import { ToolTips } from "../../constants";
import { ToggleButton } from "../../controls/toggle_button";
import { updateConfig } from "../../devices/actions";
import { noop } from "lodash";

export const LogsSettingsMenu = (bot: BotState) => {
  const {
    sequence_init_log, sequence_body_log, sequence_complete_log
  } = bot.hardware.configuration;
  return <div className={"logs-settings-menu"}>
    {t("Create logs for sequence:")}
    <fieldset>
      <label>
        {t("Begin")}
      </label>
      <Help text={t(ToolTips.SEQUENCE_LOG_BEGIN)} />
      <ToggleButton toggleValue={sequence_init_log}
        toggleAction={() => {
          updateConfig({ sequence_init_log: !sequence_init_log })(noop);
        }} />
    </fieldset>
    <fieldset>
      <label>
        {t("Steps")}
      </label>
      <Help text={t(ToolTips.SEQUENCE_LOG_STEP)} />
      <ToggleButton toggleValue={sequence_body_log}
        toggleAction={() => {
          updateConfig({ sequence_body_log: !sequence_body_log })(noop);
        }} />
    </fieldset>
    <fieldset>
      <label>
        {t("Complete")}
      </label>
      <Help text={t(ToolTips.SEQUENCE_LOG_END)} />
      <ToggleButton toggleValue={sequence_complete_log}
        toggleAction={() => {
          updateConfig({
            sequence_complete_log: !sequence_complete_log
          })(noop);
        }} />
    </fieldset>
  </div>;
};
