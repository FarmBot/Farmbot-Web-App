import React from "react";
import { warning } from "../../toast/toast";
import { McuInputBoxProps } from "./interfaces";
import { updateMCU } from "../../devices/actions";
import { BlurableInput } from "../../ui";
import {
  clampInteger, IntegerSize, getMaxInputFromIntSize,
} from "../../util";
import { isUndefined, some } from "lodash";
import { t } from "../../i18next_wrapper";
import { getModifiedClassName } from "./default_values";
import {
  initSettingStatusState,
  SettingStatusIndicator, SettingStatusState, SETTING_SYNC_TIMEOUT,
} from "./setting_status_indicator";
import { McuParamName } from "farmbot";

export class McuInputBox
  extends React.Component<McuInputBoxProps, SettingStatusState> {
  state: SettingStatusState = initSettingStatusState();

  get key() { return this.props.setting; }

  get config() {
    return this.props.sourceFwConfig(this.key);
  }

  get value() {
    const v = this.config.value;
    const { filter } = this.props;
    const goodValue = !isUndefined(v) && !(filter && v > filter);
    return goodValue ? (v || 0).toString() : "";
  }

  get wrapperClassName() {
    const { firmwareHardware } = this.props;
    const value = microstepScaledConfig(this.key)
      ? (this.config.value || 1) / (this.props.scale || 1)
      : this.config.value;
    return getModifiedClassName(this.key, value, firmwareHardware);
  }

  get showValue() {
    return this.props.scale
      ? "" + parseInt(this.value) / this.props.scale
      : this.value;
  }

  get className() {
    const gray = this.props.gray ? "gray" : "";
    return [gray].join(" ");
  }

  clampInputAndWarn = (input: string, intSize: IntegerSize): number => {
    const result = clampInteger(input, intSize, {
      min: this.props.min, max: this.props.max
    });
    const min = result.min.toLocaleString();
    const max = result.max.toLocaleString();
    switch (result.outcome) {
      case "ok":
        break;
      case "high":
        warning(t(`Maximum input is ${max}. Rounding down.`));
        break;
      case "low":
        warning(t(`Minimum input is ${min}. Rounding up.`));
        break;
      default:
        warning(t(`Please enter a number between ${min} and ${max}`));
        throw new Error("Bad input in mcu_input_box. Impossible?");
    }
    return result.result;
  };

  commit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const scaledValue = this.props.scale
      ? "" + Math.round(parseFloat(value) * this.props.scale)
      : value;
    const actuallyDifferent = this.value !== scaledValue;
    if (actuallyDifferent) {
      const result = this.props.float
        ? Math.max(0, parseFloat(scaledValue))
        : this.clampInputAndWarn(scaledValue, this.props.intSize);
      this.props.dispatch(updateMCU(this.key, result.toString()));
    }
  };

  componentDidUpdate = () => {
    const inconsistent = !this.config.consistent;
    const changed = inconsistent != this.state.inconsistent;
    if (!isUndefined(inconsistent) && changed) {
      this.setState({ inconsistent, syncing: true });
      this.state.timeout && clearTimeout(this.state.timeout);
      const timeout = setTimeout(() => this.setState({ syncing: false }),
        SETTING_SYNC_TIMEOUT);
      this.setState({ timeout });
    }
  };

  render() {
    return <div className={"mcu-input-box"}>
      <BlurableInput
        type="number"
        className={this.className}
        wrapperClassName={this.wrapperClassName}
        title={this.props.title}
        value={this.showValue}
        onCommit={this.commit}
        disabled={this.props.disabled}
        error={this.props.warnMin && parseInt(this.showValue) &&
          (parseInt(this.showValue) < this.props.warnMin)
          ? t("Warning: low value")
          : this.props.warning}
        min={this.props.min || 0}
        max={this.props.max || getMaxInputFromIntSize(this.props.intSize)} />
      <SettingStatusIndicator
        dispatch={this.props.dispatch}
        wasSyncing={this.state.syncing}
        isSyncing={!this.config.consistent} />
    </div>;
  }
}

export const microstepScaledConfig = (key: McuParamName) =>
  some(["step_per_mm", "encoder_scaling"].map(part => key.includes(part)));
