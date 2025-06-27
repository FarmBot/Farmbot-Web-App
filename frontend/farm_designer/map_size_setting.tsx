import React from "react";
import {
  GetWebAppConfigValue, setWebAppConfigValue,
} from "../config_storage/actions";
import { t } from "../i18next_wrapper";
import { BlurableInput, Row } from "../ui";
import { BooleanSetting, NumericSetting } from "../session_keys";
import {
  NumberConfigKey as WebAppNumberConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { getModifiedClassName } from "../settings/default_values";
import { McuParams } from "farmbot";

interface LengthInputProps {
  value: number;
  label: string;
  setting: WebAppNumberConfigKey;
  dispatch: Function;
  disabled: boolean;
}

const LengthInput = (props: LengthInputProps) =>
  <Row className="grid-2-col map-size-grid">
    <label>{t(props.label)}</label>
    <BlurableInput
      type="number"
      name={props.setting}
      disabled={props.disabled}
      className={getModifiedClassName(props.setting)}
      value={"" + props.value}
      onCommit={e => props.dispatch(setWebAppConfigValue(
        props.setting, e.currentTarget.value))} />
  </Row>;

export interface MapSizeInputsProps {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  firmwareConfig: McuParams | undefined;
}

export const MapSizeInputs = (props: MapSizeInputsProps) => {
  const { firmwareConfig } = props;
  const dynamicMap = props.getConfigValue(BooleanSetting.dynamic_map);
  const disabledX = !!(dynamicMap &&
    firmwareConfig &&
    firmwareConfig.movement_axis_nr_steps_x &&
    firmwareConfig.movement_stop_at_max_x);
  const disabledY = !!(dynamicMap &&
    firmwareConfig &&
    firmwareConfig.movement_axis_nr_steps_y &&
    firmwareConfig.movement_stop_at_max_y);
  return <div className="grid">
    <LengthInput
      disabled={disabledX}
      value={parseInt("" + props.getConfigValue(NumericSetting.map_size_x))}
      label={t("x (mm)")}
      setting={NumericSetting.map_size_x}
      dispatch={props.dispatch} />
    <LengthInput
      disabled={disabledY}
      value={parseInt("" + props.getConfigValue(NumericSetting.map_size_y))}
      label={t("y (mm)")}
      setting={NumericSetting.map_size_y}
      dispatch={props.dispatch} />
  </div>;
};
