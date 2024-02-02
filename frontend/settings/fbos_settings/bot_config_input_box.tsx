import React from "react";
import { BlurableInput } from "../../ui";
import { SourceFbosConfig } from "../../devices/interfaces";
import { ConfigurationName } from "farmbot";
import { updateConfig } from "../../devices/actions";
import { parseIntInput } from "../../util";
import { isNumber, isBoolean, isNaN } from "lodash";
import { getModifiedClassName } from "./default_values";
import { validFirmwareHardware } from "../firmware/firmware_hardware_support";

export interface BotConfigInputBoxProps {
  setting: ConfigurationName;
  dispatch: Function;
  disabled?: boolean;
  sourceFbosConfig: SourceFbosConfig;
}

export class BotConfigInputBox
  extends React.Component<BotConfigInputBoxProps, {}> {

  get config() {
    return this.props.sourceFbosConfig(this.props.setting);
  }

  change = (key: ConfigurationName, dispatch: Function) => {
    return (event: React.FormEvent<HTMLInputElement>) => {
      const next = parseIntInput(event.currentTarget.value);
      const current = this.config.value;
      if (!isNaN(next) && (next !== current)) {
        dispatch(updateConfig({ [key]: next }));
      }
    };
  };

  render() {
    const current = this.config.value;
    const boxValue = (isNumber(current) || isBoolean(current))
      ? current.toString()
      : "";
    const firmwareHardware = validFirmwareHardware(
      this.props.sourceFbosConfig("firmware_hardware").value);
    return <BlurableInput
      type="number"
      className={!this.config.consistent ? "dim" : ""}
      wrapperClassName={getModifiedClassName(this.props.setting, current,
        firmwareHardware)}
      onCommit={this.change(this.props.setting, this.props.dispatch)}
      value={boxValue}
      disabled={this.props.disabled} />;
  }
}
