import React from "react";
import { McuInputBox, microstepScaledConfig } from "./mcu_input_box";
import { NumericMCUInputGroupProps } from "./interfaces";
import { Row, Col, Help } from "../../ui";
import { Highlight } from "../maybe_highlight";
import { t } from "../../i18next_wrapper";
import { getDefaultFwConfigValue } from "./default_values";
import { McuParamName } from "farmbot";

export class NumericMCUInputGroup
  extends React.Component<NumericMCUInputGroupProps> {

  Inputs = () => {
    const {
      sourceFwConfig, dispatch, intSize, gray, float, firmwareHardware, warning,
      x, y, z, xScale, yScale, zScale, min, max, disabled, disabledBy, warnMin,
    } = this.props;
    const commonProps = {
      sourceFwConfig,
      dispatch,
      firmwareHardware,
      intSize,
      float,
      min,
      max,
      disabled,
    };
    return <div className={"mcu-inputs"}>
      <Col xs={3} className={"low-pad"}>
        <McuInputBox {...commonProps}
          setting={x}
          scale={xScale}
          title={gray?.x ? disabledBy : undefined}
          warnMin={warnMin?.x}
          warning={warning?.x}
          gray={gray?.x} />
      </Col>
      <Col xs={3} className={"low-pad"}>
        <McuInputBox {...commonProps}
          setting={y}
          scale={yScale}
          title={gray?.y ? disabledBy : undefined}
          warnMin={warnMin?.y}
          warning={warning?.y}
          gray={gray?.y} />
      </Col>
      <Col xs={3} className={"low-pad"}>
        <McuInputBox {...commonProps}
          setting={z}
          scale={zScale}
          title={gray?.z ? disabledBy : undefined}
          warnMin={warnMin?.z}
          warning={warning?.z}
          gray={gray?.z} />
      </Col>
    </div>;
  };

  get getDefault() { return getDefaultFwConfigValue(this.props.firmwareHardware); }

  get tooltip() {
    const scale = {
      x: microstepScaledConfig(this.props.x) ? 1 : this.props.xScale || 1,
      y: microstepScaledConfig(this.props.y) ? 1 : this.props.yScale || 1,
      z: microstepScaledConfig(this.props.z) ? 1 : this.props.zScale || 1,
    };
    return t(this.props.tooltip, {
      x: this.getDefault(this.props.x) / scale.x,
      y: this.getDefault(this.props.y) / scale.y,
      z: this.getDefault(this.props.z) / scale.z,
    });
  }

  get anyModified() {
    const modified = (setting: McuParamName, scale: number | undefined) => {
      const value = microstepScaledConfig(setting)
        ? (this.props.sourceFwConfig(setting).value || 1) / (scale || 1)
        : this.props.sourceFwConfig(setting).value;
      return this.getDefault(setting) != value;
    };
    return modified(this.props.x, this.props.xScale)
      || modified(this.props.y, this.props.yScale)
      || modified(this.props.z, this.props.zScale);
  }

  get error() {
    return this.props.warning?.x
      || this.props.warning?.y
      || this.props.warning?.z;
  }

  render() {
    const { label } = this.props;
    return <Highlight settingName={label}
      hidden={this.props.advanced && !(this.props.showAdvanced || this.anyModified)
        && !this.error}
      className={this.props.advanced ? "advanced" : undefined}>
      <Row>
        <Col xs={3} className={"widget-body-tooltips"}>
          <label>
            {t(label)}
          </label>
          <Help text={this.tooltip} />
        </Col>
        <this.Inputs />
      </Row>
    </Highlight>;
  }
}
