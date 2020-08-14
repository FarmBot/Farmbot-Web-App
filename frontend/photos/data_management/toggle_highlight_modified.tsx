import React from "react";
import { t } from "../../i18next_wrapper";
import { ToggleButton } from "../../controls/toggle_button";
import { BooleanSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { ToggleHighlightModifiedProps } from "./interfaces";

export const ToggleHighlightModified = (props: ToggleHighlightModifiedProps) =>
  <div className={"highlight-modified-toggle"}>
    <label>{t("Highlight settings modified from default")}</label>
    <ToggleButton
      toggleValue={!!props.getConfigValue(
        BooleanSetting.highlight_modified_settings)}
      toggleAction={() => props.dispatch(setWebAppConfigValue(
        BooleanSetting.highlight_modified_settings,
        !props.getConfigValue(
          BooleanSetting.highlight_modified_settings)))} />
  </div>;
