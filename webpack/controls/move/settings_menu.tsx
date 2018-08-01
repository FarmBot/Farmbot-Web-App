import * as React from "react";
import { t } from "i18next";
import { Popover, Position } from "@blueprintjs/core";
import {
  BooleanConfigKey as BooleanWebAppConfigKey
} from "../../config_storage/web_app_configs";
import { BooleanSetting } from "../../session_keys";
import { ToggleButton } from "../toggle_button";
import { ToggleWebAppBool, GetWebAppBool } from "./interfaces";

export const moveWidgetSetting = (toggle: ToggleWebAppBool, getValue: GetWebAppBool) =>
  ({ label, setting }: { label: string, setting: BooleanWebAppConfigKey }) =>
    <fieldset>
      <label>
        {t(label)}
      </label>
      <ToggleButton
        toggleAction={toggle(BooleanSetting[setting])}
        toggleValue={getValue(setting)} />
    </fieldset>;

export const MoveWidgetSettingsMenu = ({ toggle, getValue }: {
  toggle: ToggleWebAppBool,
  getValue: GetWebAppBool
}) => {
  const Setting = moveWidgetSetting(toggle, getValue);
  return <Popover position={Position.BOTTOM_RIGHT}>
    <i className="fa fa-gear" />
    <div className="move-settings-menu">
      <p>{t("Invert Jog Buttons")}</p>
      <Setting label={t("X Axis")} setting={BooleanSetting.x_axis_inverted} />
      <Setting label={t("Y Axis")} setting={BooleanSetting.y_axis_inverted} />
      <Setting label={t("Z Axis")} setting={BooleanSetting.z_axis_inverted} />

      <p>{t("Display Encoder Data")}</p>
      <Setting
        label={t("Scaled encoder position")}
        setting={BooleanSetting.scaled_encoders} />
      <Setting
        label={t("Raw encoder position")}
        setting={BooleanSetting.raw_encoders} />

      <p>{t("Swap jog buttons (and rotate map)")}</p>
      <Setting label={t("x and y axis")} setting={BooleanSetting.xy_swap} />

      <p>{t("Home button behavior")}</p>
      <Setting
        label={t("perform homing (find home)")}
        setting={BooleanSetting.home_button_homing} />
    </div>
  </Popover>;
};
