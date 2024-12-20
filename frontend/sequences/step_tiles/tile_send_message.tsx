import React from "react";
import { FBSelect, DropDownItem } from "../../ui";
import { StepInputBox } from "../inputs/step_input_box";
import { SendMessage } from "farmbot";
import { ChannelName, isMessageType, StepParams } from "../interfaces";
import { editStep } from "../../api/crud";
import { ToolTips } from "../../constants";
import {
  MESSAGE_STATUSES, EACH_CHANNEL, channel, MESSAGE_STATUSES_DDI,
} from "./tile_send_message_support";
import { StepWrapper } from "../step_ui";
import { t } from "../../i18next_wrapper";
import { InputLengthIndicator } from "../inputs/input_length_indicator";

interface TileSendMessageState {
  message: string;
}

export class TileSendMessage
  extends React.Component<StepParams<SendMessage>, TileSendMessageState> {
  state: TileSendMessageState = { message: this.props.currentStep.args.message };

  get currentSelection() {
    return MESSAGE_STATUSES_DDI()[this.props.currentStep.args.message_type];
  }

  get channels() {
    return (this.props.currentStep.body || []).map(x => x.args.channel_name);
  }

  hasChannel = (channelName: ChannelName) => {
    return this.channels.includes(channelName);
  };

  add = (channelName: ChannelName) => (s: SendMessage) => {
    s.body = s.body || [];
    s.body.push(channel(channelName));
  };

  remove = (channelName: ChannelName) => (s: SendMessage) => {
    s.body = (s.body || []).filter(x => x.args.channel_name !== channelName);
  };

  toggle = (n: ChannelName) => () => {
    this.props.dispatch(editStep({
      sequence: this.props.currentSequence,
      step: this.props.currentStep,
      index: this.props.index,
      executor: this.hasChannel(n) ? this.remove(n) : this.add(n)
    }));
  };

  setMsgType = (x: DropDownItem) => {
    this.props.dispatch(editStep({
      sequence: this.props.currentSequence,
      step: this.props.currentStep,
      index: this.props.index,
      executor: (step: SendMessage) => {
        if (isMessageType(x.value)) {
          step.args.message_type = x.value;
        } else {
          throw new Error("message_type must be one of ALLOWED_MESSAGE_TYPES.");
        }
      }
    }));
  };

  updateMessage = (_key: string, buffer: string) =>
    this.setState({ message: buffer });

  render() {
    const { dispatch, index, currentStep, currentSequence } = this.props;
    return <StepWrapper {...this.props}
      className={"send-message-step"}
      helpText={t(ToolTips.SEND_MESSAGE)}>
      <div className="grid">
        <div className="grid half-gap">
          <div className="row grid-exp-1">
            <label>{t("Message")}</label>
            <InputLengthIndicator field={"message"}
              value={this.state.message} />
          </div>
          <StepInputBox dispatch={dispatch}
            step={currentStep}
            sequence={currentSequence}
            index={index}
            keyCallback={this.updateMessage}
            field="message" />
        </div>
        <div className="row align-baseline">
          <div className="grid half-gap">
            <label>{t("type")}</label>
            <FBSelect
              onChange={this.setMsgType}
              selectedItem={this.currentSelection}
              list={MESSAGE_STATUSES()} />
          </div>
          <div>
            {EACH_CHANNEL().map((chan, inx) => {
              return <fieldset key={inx}>
                <label htmlFor={chan.name}>
                  {chan.label}
                </label>
                <input type="checkbox" name={chan.name}
                  id={chan.name}
                  onChange={this.toggle(chan.name)}
                  checked={
                    this.hasChannel(chan.name) || chan.alwaysOn}
                  disabled={chan.alwaysOn} />
              </fieldset>;
            })}
          </div>
        </div>
      </div>
    </StepWrapper>;
  }
}
