import React from "react";
import { t } from "../../i18next_wrapper";
import { ToggleButton } from "../../ui/toggle_button";
import { BooleanSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { ToggleHighlightModifiedProps } from "./interfaces";
import { DeviceSetting } from "../../constants";

export const ToggleHighlightModified = (props: ToggleHighlightModifiedProps) => {
  const { getConfigValue, dispatch } = props;
  const value = !!getConfigValue(BooleanSetting.highlight_modified_settings);
  return <div className={"highlight-modified-toggle"}>
    <label>{t(DeviceSetting.highlightSettingsModifiedFromDefault)}</label>
    <ToggleButton
      className={value ? "modified" : ""}
      toggleValue={value}
      toggleAction={() => dispatch(setWebAppConfigValue(
        BooleanSetting.highlight_modified_settings, !value))} />
  </div>;
};
