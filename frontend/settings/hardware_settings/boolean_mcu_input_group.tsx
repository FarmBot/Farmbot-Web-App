import React from "react";
import { settingToggle } from "../../devices/actions";
import { Row, Col, Help, ToggleButton } from "../../ui";
import { BooleanMCUInputGroupProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import {
  getDefaultFwConfigValue, getModifiedClassName,
} from "./default_values";
import { McuParamName } from "farmbot";

export class BooleanMCUInputGroup
  extends React.Component<BooleanMCUInputGroupProps> {

  wrapperClassName = (key: McuParamName, value: number | undefined) => {
    const { firmwareHardware } = this.props;
    return getModifiedClassName(key, value, firmwareHardware);
  };

  Toggles = () => {
    const {
      sourceFwConfig, dispatch, disable, grayscale, displayAlert, disabledBy,
      x, y, z,
    } = this.props;
    const xParam = sourceFwConfig(x);
    const yParam = sourceFwConfig(y);
    const zParam = sourceFwConfig(z);
    const width = 3;
    return <div className={"mcu-inputs"}>
      <Col xs={width} className={"centered-button-div low-pad"}>
        <ToggleButton dispatch={dispatch}
          grayscale={grayscale?.x}
          disabled={this.props.disabled || disable?.x}
          dim={!xParam.consistent}
          title={grayscale?.x ? disabledBy : undefined}
          toggleValue={xParam.value}
          className={this.wrapperClassName(x, xParam.value)}
          toggleAction={() =>
            dispatch(settingToggle(x, sourceFwConfig, displayAlert))} />
      </Col>
      <Col xs={width} className={"centered-button-div low-pad"}>
        <ToggleButton dispatch={dispatch}
          grayscale={grayscale?.y}
          disabled={this.props.disabled || disable?.y}
          dim={!yParam.consistent}
          title={grayscale?.y ? disabledBy : undefined}
          toggleValue={yParam.value}
          className={this.wrapperClassName(y, yParam.value)}
          toggleAction={() =>
            dispatch(settingToggle(y, sourceFwConfig, displayAlert))} />
      </Col>
      <Col xs={width} className={"centered-button-div low-pad"}>
        <ToggleButton dispatch={dispatch}
          grayscale={grayscale?.z}
          disabled={this.props.disabled || disable?.z}
          dim={!zParam.consistent}
          title={grayscale?.z ? disabledBy : undefined}
          toggleValue={zParam.value}
          className={this.wrapperClassName(z, zParam.value)}
          toggleAction={() =>
            dispatch(settingToggle(z, sourceFwConfig, displayAlert))} />
      </Col>
    </div>;
  };

  get getDefault() { return getDefaultFwConfigValue(this.props.firmwareHardware); }

  get tooltip() {
    return t(this.props.tooltip, {
      x: this.getDefault(this.props.x) ? t("enabled") : t("disabled"),
      y: this.getDefault(this.props.y) ? t("enabled") : t("disabled"),
      z: this.getDefault(this.props.z) ? t("enabled") : t("disabled"),
    });
  }

  get anyModified() {
    const modified = (setting: McuParamName) =>
      this.getDefault(setting) != this.props.sourceFwConfig(setting).value;
    return modified(this.props.x)
      || modified(this.props.y)
      || modified(this.props.z);
  }

  render() {
    return <Highlight settingName={this.props.label}
      hidden={this.props.advanced && !(this.props.showAdvanced || this.anyModified)}
      className={this.props.advanced ? "advanced" : undefined}>
      <Row>
        <Col xs={3} className={"widget-body-tooltips"}>
          <label>
            {t(this.props.label)}
            {this.props.caution &&
              <i className="fa fa-exclamation-triangle caution-icon" />}
          </label>
          <Help text={this.tooltip} />
        </Col>
        <this.Toggles />
      </Row>
    </Highlight>;
  }
}
