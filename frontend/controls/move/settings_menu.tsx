import * as React from "react";
import { BooleanSetting } from "../../session_keys";
import { ToggleButton } from "../toggle_button";
import { ToggleWebAppBool, GetWebAppBool } from "./interfaces";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { DevSettings } from "../../account/dev/dev_support";
import { t } from "../../i18next_wrapper";
import { FirmwareHardware } from "farmbot";
import { hasEncoders } from "../../devices/components/firmware_hardware_support";

export const moveWidgetSetting =
  (toggle: ToggleWebAppBool, getValue: GetWebAppBool) =>
    ({ label, setting }: { label: string, setting: BooleanConfigKey }) =>
      <fieldset>
        <label>
          {t(label)}
        </label>
        <ToggleButton
          toggleAction={toggle(BooleanSetting[setting])}
          toggleValue={getValue(setting)} />
      </fieldset>;

export interface MoveWidgetSettingsMenuProps {
  toggle: ToggleWebAppBool;
  getValue: GetWebAppBool;
  firmwareHardware: FirmwareHardware | undefined;
}

export const MoveWidgetSettingsMenu = (
  { toggle, getValue, firmwareHardware }: MoveWidgetSettingsMenuProps
) => {
  const Setting = moveWidgetSetting(toggle, getValue);
  return <div className="move-settings-menu">
    <p>{t("Invert Jog Buttons")}</p>
    <Setting label={t("X Axis")} setting={BooleanSetting.x_axis_inverted} />
    <Setting label={t("Y Axis")} setting={BooleanSetting.y_axis_inverted} />
    <Setting label={t("Z Axis")} setting={BooleanSetting.z_axis_inverted} />

    {hasEncoders(firmwareHardware) &&
      <div className="display-encoder-data">
        <p>{t("Display Encoder Data")}</p>
        <Setting
          label={t("Scaled encoder position")}
          setting={BooleanSetting.scaled_encoders} />
        <Setting
          label={t("Raw encoder position")}
          setting={BooleanSetting.raw_encoders} />
      </div>}

    <p>{t("Swap jog buttons (and rotate map)")}</p>
    <Setting label={t("x and y axis")} setting={BooleanSetting.xy_swap} />

    <p>{t("Home button behavior")}</p>
    <Setting
      label={t("perform homing (find home)")}
      setting={BooleanSetting.home_button_homing} />

    {DevSettings.futureFeaturesEnabled() &&
      <div>
        <p>{t("Motor position plot")}</p>
        <Setting
          label={t("show")}
          setting={BooleanSetting.show_motor_plot} />
      </div>}
  </div>;
};
