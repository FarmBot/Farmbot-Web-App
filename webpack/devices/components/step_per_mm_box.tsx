import * as React from "react";
import * as _ from "lodash";
import { BlurableInput } from "../../ui/index";
import { StepsPerMMBoxProps } from "../interfaces";
import { ConfigurationName } from "farmbot/dist";
import { updateConfig } from "../actions";

/**
 * Steps per mm is not an actual Arduino command.
 * We needed to fake it on the UI layer to give the appearance that the settings
 * all coming from the same place.
 */
export class BotConfigInputBox extends React.Component<StepsPerMMBoxProps, {}> {

  get setting() { return this.props.setting; }

  get config() { return this.props.bot.hardware.configuration; }

  change = (key: ConfigurationName, dispatch: Function) => {
    return (event: React.FormEvent<HTMLInputElement>) => {
      let next = parseInt(event.currentTarget.value, 10);
      let current = this.config[this.setting];
      if (!_.isNaN(next) && (next !== current)) {
        dispatch(updateConfig({ [key]: next }));
      }
    };
  }

  render() {
    let hmm = this.config[this.setting];
    let value = (_.isNumber(hmm) || _.isBoolean(hmm)) ? hmm.toString() : "";

    return <BlurableInput
      type="number"
      onCommit={this.change(this.props.setting, this.props.dispatch)}
      value={value}
    />;
  }
}
