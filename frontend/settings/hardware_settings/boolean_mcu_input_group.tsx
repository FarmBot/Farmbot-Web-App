import React from "react";
import { settingToggle } from "../../devices/actions";
import { Row, Help, ToggleButton } from "../../ui";
import { BooleanMCUInputGroupProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import {
  getDefaultFwConfigValue, getModifiedClassName,
} from "./default_values";
import { McuParamName } from "farmbot";

export const BooleanMCUInputGroup = (props: BooleanMCUInputGroupProps) => {

  const wrapperClassName = (key: McuParamName, value: number | undefined) => {
    return getModifiedClassName(key, value, props.firmwareHardware);
  };

  const getDefault = getDefaultFwConfigValue(props.firmwareHardware);

  const tooltip = t(props.tooltip, {
    x: getDefault(props.x) ? t("enabled") : t("disabled"),
    y: getDefault(props.y) ? t("enabled") : t("disabled"),
    z: getDefault(props.z) ? t("enabled") : t("disabled"),
  });

  const anyModified = () => {
    const modified = (setting: McuParamName) =>
      getDefault(setting) != props.sourceFwConfig(setting).value;
    return modified(props.x)
      || modified(props.y)
      || modified(props.z);
  };

  const {
    sourceFwConfig, dispatch, disable, grayscale, displayAlert, disabledBy,
    x, y, z,
  } = props;
  const xParam = sourceFwConfig(x);
  const yParam = sourceFwConfig(y);
  const zParam = sourceFwConfig(z);
  return <Highlight settingName={props.label}
    hidden={props.advanced && !(props.showAdvanced || anyModified())}
    className={props.advanced ? "advanced" : undefined}>
    <Row className="axes-grid">
      <div>
        <label>
          {t(props.label)}
          {props.caution &&
            <i className="fa fa-exclamation-triangle caution-icon" />}
        </label>
        <Help text={tooltip} />
      </div>
      <div className={"mcu-inputs row no-gap"}>
        <ToggleButton dispatch={dispatch}
          grayscale={grayscale?.x}
          disabled={props.disabled || disable?.x}
          dim={!xParam.consistent}
          title={grayscale?.x ? disabledBy : undefined}
          toggleValue={xParam.value}
          className={wrapperClassName(x, xParam.value)}
          toggleAction={() =>
            dispatch(settingToggle(x, sourceFwConfig, displayAlert))} />
        <ToggleButton dispatch={dispatch}
          grayscale={grayscale?.y}
          disabled={props.disabled || disable?.y}
          dim={!yParam.consistent}
          title={grayscale?.y ? disabledBy : undefined}
          toggleValue={yParam.value}
          className={wrapperClassName(y, yParam.value)}
          toggleAction={() =>
            dispatch(settingToggle(y, sourceFwConfig, displayAlert))} />
        <ToggleButton dispatch={dispatch}
          grayscale={grayscale?.z}
          disabled={props.disabled || disable?.z}
          dim={!zParam.consistent}
          title={grayscale?.z ? disabledBy : undefined}
          toggleValue={zParam.value}
          className={wrapperClassName(z, zParam.value)}
          toggleAction={() =>
            dispatch(settingToggle(z, sourceFwConfig, displayAlert))} />
      </div>
    </Row>
  </Highlight>;
};
