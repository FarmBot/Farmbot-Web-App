import React from "react";
import { McuInputBox, microstepScaledConfig } from "./mcu_input_box";
import { NumericMCUInputGroupProps } from "./interfaces";
import { Row, Help } from "../../ui";
import { Highlight } from "../maybe_highlight";
import { t } from "../../i18next_wrapper";
import { getDefaultFwConfigValue } from "./default_values";
import { McuParamName } from "farmbot";

export const NumericMCUInputGroup = (props: NumericMCUInputGroupProps) => {

  const getDefault = getDefaultFwConfigValue(props.firmwareHardware);

  const tooltip = () => {
    const scale = {
      x: microstepScaledConfig(props.x) ? 1 : props.xScale || 1,
      y: microstepScaledConfig(props.y) ? 1 : props.yScale || 1,
      z: microstepScaledConfig(props.z) ? 1 : props.zScale || 1,
    };
    const unscaled = {
      x: getDefault(props.x),
      y: getDefault(props.y),
      z: getDefault(props.z),
    };
    const { toInput } = props;
    return t(props.tooltip, {
      x: toInput ? toInput(unscaled.x) : unscaled.x / scale.x,
      y: toInput ? toInput(unscaled.y) : unscaled.y / scale.y,
      z: toInput ? toInput(unscaled.z) : unscaled.z / scale.z,
    });
  };

  const anyModified = () => {
    const modified = (setting: McuParamName, scale: number | undefined) => {
      const value = microstepScaledConfig(setting)
        ? (props.sourceFwConfig(setting).value || 1) / (scale || 1)
        : props.sourceFwConfig(setting).value;
      const compareVal = (val: number | undefined) => {
        const { toInput } = props;
        return toInput ? toInput(val || 0) : val;
      };
      return compareVal(getDefault(setting)) != compareVal(value);
    };
    return modified(props.x, props.xScale)
      || modified(props.y, props.yScale)
      || modified(props.z, props.zScale);
  };

  const error = props.warning?.x
    || props.warning?.y
    || props.warning?.z;

  const {
    sourceFwConfig, dispatch, intSize, gray, float, firmwareHardware, warning,
    x, y, z, xScale, yScale, zScale, min, max, disabled, disabledBy, warnMin,
    toInput, fromInput, inputMax, label,
  } = props;
  const commonProps = {
    sourceFwConfig,
    dispatch,
    firmwareHardware,
    intSize,
    float,
    min,
    max,
    inputMax,
    disabled,
    toInput,
    fromInput,
  };
  return <Highlight settingName={label}
    hidden={props.forceHidden ||
      (props.advanced && !(props.showAdvanced || anyModified())
        && !error)}
    className={props.advanced ? "advanced" : undefined}>
    <Row className="axes-grid">
      <div>
        <label>
          {t(label)}
        </label>
        <Help text={tooltip()} />
      </div>
      <div className={"mcu-inputs row"}>
        <McuInputBox {...commonProps}
          setting={x}
          scale={xScale}
          title={gray?.x ? disabledBy : undefined}
          warnMin={warnMin?.x}
          warning={warning?.x}
          gray={gray?.x} />
        <McuInputBox {...commonProps}
          setting={y}
          scale={yScale}
          title={gray?.y ? disabledBy : undefined}
          warnMin={warnMin?.y}
          warning={warning?.y}
          gray={gray?.y} />
        <McuInputBox {...commonProps}
          setting={z}
          scale={zScale}
          title={gray?.z ? disabledBy : undefined}
          warnMin={warnMin?.z}
          warning={warning?.z}
          gray={gray?.z} />
      </div>
    </Row>
  </Highlight>;
};
