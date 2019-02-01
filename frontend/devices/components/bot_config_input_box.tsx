import * as React from "react";
import _ from "lodash";
import { BlurableInput } from "../../ui/index";
import { SourceFbosConfig } from "../interfaces";
import { ConfigurationName } from "farmbot/dist";
import { updateConfig } from "../actions";
import { parseIntInput } from "../../util";

export interface BotConfigInputBoxProps {
  setting: ConfigurationName;
  dispatch: Function;
  disabled?: boolean;
  sourceFbosConfig: SourceFbosConfig;
}

/**
 * Currently only used for `network_not_found_timer` and `steps_per_mm_?`.
 */
export class BotConfigInputBox
  extends React.Component<BotConfigInputBoxProps, {}> {

  get config() {
    return this.props.sourceFbosConfig(this.props.setting);
  }

  change = (key: ConfigurationName, dispatch: Function) => {
    return (event: React.FormEvent<HTMLInputElement>) => {
      const next = parseIntInput(event.currentTarget.value);
      const current = this.config.value;
      if (!_.isNaN(next) && (next !== current)) {
        dispatch(updateConfig({ [key]: next }));
      }
    };
  }

  render() {
    const current = this.config.value;
    const boxValue = (_.isNumber(current) || _.isBoolean(current))
      ? current.toString() : "";

    return <BlurableInput
      type="number"
      className={!this.config.consistent ? "dim" : ""}
      onCommit={this.change(this.props.setting, this.props.dispatch)}
      value={boxValue}
      disabled={this.props.disabled} />;
  }
}
