import React from "react";
import { BooleanSetting } from "../../session_keys";
import { ToggleButton } from "../../ui";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { t } from "../../i18next_wrapper";
import { FirmwareHardware } from "farmbot";
import { hasEncoders } from "../../settings/firmware/firmware_hardware_support";
import { DeviceSetting } from "../../constants";
import { getModifiedClassName } from "../../settings/default_values";
import {
  GetWebAppConfigValue, toggleWebAppBool,
} from "../../config_storage/actions";

export interface SettingProps {
  label: DeviceSetting;
  setting: BooleanConfigKey;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export const Setting =
  ({ label, setting, dispatch, getConfigValue }: SettingProps) =>
    <fieldset>
      <label>
        {t(label)}
      </label>
      <ToggleButton
        className={getModifiedClassName(setting)}
        toggleAction={() => dispatch(toggleWebAppBool(BooleanSetting[setting]))}
        toggleValue={!!getConfigValue(setting)} />
    </fieldset>;

export interface MoveWidgetSettingsMenuProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  firmwareHardware: FirmwareHardware | undefined;
}

export const MoveWidgetSettingsMenu = (
  { dispatch, getConfigValue, firmwareHardware }: MoveWidgetSettingsMenuProps,
) => {
  const common = { dispatch, getConfigValue };
  return <div className="move-settings-menu">
    <p>{t("Invert Jog Buttons")}</p>
    <Setting {...common} label={DeviceSetting.invertJogButtonXAxis}
      setting={BooleanSetting.x_axis_inverted} />
    <Setting {...common} label={DeviceSetting.invertJogButtonYAxis}
      setting={BooleanSetting.y_axis_inverted} />
    <Setting {...common} label={DeviceSetting.invertJogButtonZAxis}
      setting={BooleanSetting.z_axis_inverted} />

    {hasEncoders(firmwareHardware) &&
      <div className="display-encoder-data">
        <p>{t("Display Encoder Data")}</p>
        <Setting {...common}
          label={DeviceSetting.displayScaledEncoderPosition}
          setting={BooleanSetting.scaled_encoders} />
        <Setting {...common}
          label={DeviceSetting.displayRawEncoderPosition}
          setting={BooleanSetting.raw_encoders} />
      </div>}

    <p>{t("Swap jog buttons (and rotate map)")}</p>
    <Setting {...common} label={DeviceSetting.swapJogButtonsXAndYAxis}
      setting={BooleanSetting.xy_swap} />

    <div className={"motor-position-plot-setting-row"}>
      <p>{t("Plots")}</p>
      <Setting {...common}
        label={DeviceSetting.showMotorPositionPlot}
        setting={BooleanSetting.show_motor_plot} />
      {!hasEncoders(firmwareHardware) &&
        <Setting {...common}
          label={DeviceSetting.showMotorLoadPlot}
          setting={BooleanSetting.show_missed_step_plot} />}
    </div>
  </div>;
};
