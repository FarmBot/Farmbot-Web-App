import * as React from "react";
import * as _ from "lodash";
import { warning } from "farmbot-toastr";
import { McuInputBoxProps } from "../interfaces";
import { updateMCU } from "../actions";
import { BlurableInput } from "../../ui/index";
import { clampUnsignedInteger, IntegerSize } from "../../util";
import { t } from "i18next";

export class McuInputBox extends React.Component<McuInputBoxProps, {}> {

  get key() { return this.props.setting; }

  get config() {
    return this.props.sourceFwConfig(this.key);
  }

  get value() {
    const v = this.config.value;
    const { filter } = this.props;
    const goodValue = !_.isUndefined(v) && !(filter && v > filter);
    return goodValue ? (v || 0).toString() : "";
  }

  get className() {
    const dim = !this.config.consistent ? "dim" : "";
    const gray = this.props.gray ? "gray" : "";
    return [dim, gray].join(" ");
  }

  clampInputAndWarn = (input: string, intSize: IntegerSize): number => {
    const result = clampUnsignedInteger(input, intSize);
    const max = intSize === "long" ? "2,000,000,000" : "32,000";
    switch (result.outcome) {
      case "ok":
        break;
      case "high":
        warning(t(`Maximum input is ${max}. Rounding down.`));
        break;
      case "low":
        warning(t("Must be a positive number. Rounding up to 0."));
        break;
      default:
        warning(t(`Please enter a number between 0 and ${max}`));
        throw new Error("Bad input in mcu_input_box. Impossible?");
    }
    return result.result;
  }

  commit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const actuallyDifferent = this.value !== value;
    if (actuallyDifferent) {
      const result = this.props.float
        ? Math.max(0, parseFloat(value))
        : this.clampInputAndWarn(value, this.props.intSize);
      this.props.dispatch(updateMCU(this.key, result.toString()));
    }
  }

  render() {
    return <BlurableInput
      type="number"
      className={this.className}
      value={this.value}
      onCommit={this.commit} />;
  }
}
