import React from "react";
import { t } from "../../i18next_wrapper";
import { ToggleButton } from "../../ui";
import { BooleanSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { ToggleHighlightModifiedProps } from "./interfaces";
import { DeviceSetting } from "../../constants";
import { getModifiedClassName } from "../../settings/default_values";

export const ToggleHighlightModified = (props: ToggleHighlightModifiedProps) => {
  const { getConfigValue, dispatch } = props;
  const value = !!getConfigValue(BooleanSetting.highlight_modified_settings);
  return <div className={"row grid-exp-1"}>
    <label>{t(DeviceSetting.highlightModifiedSettings)}</label>
    <ToggleButton
      className={getModifiedClassName(BooleanSetting.highlight_modified_settings)}
      toggleValue={value}
      toggleAction={() => dispatch(setWebAppConfigValue(
        BooleanSetting.highlight_modified_settings, !value))} />
  </div>;
};
