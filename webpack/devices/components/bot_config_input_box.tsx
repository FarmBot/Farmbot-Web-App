import * as React from "react";
import * as _ from "lodash";
import { BlurableInput } from "../../ui/index";
import { SourceFbosConfig } from "../interfaces";
import { ConfigurationName } from "farmbot/dist";
import { updateConfig } from "../actions";

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
      const next = parseInt(event.currentTarget.value, 10);
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
