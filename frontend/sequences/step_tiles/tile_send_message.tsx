import * as React from "react";
import { FBSelect, DropDownItem, Row, Col } from "../../ui/index";
import { StepInputBox } from "../inputs/step_input_box";
import { SendMessage, TaggedSequence } from "farmbot";
import { StepParams, ChannelName, isMessageType } from "../interfaces";
import { ResourceIndex } from "../../resources/interfaces";
import { editStep } from "../../api/crud";
import { ToolTips } from "../../constants";
import {
  MESSAGE_STATUSES,
  EACH_CHANNEL,
  channel,
  MESSAGE_STATUSES_DDI
} from "./tile_send_message_support";
import { StepWrapper, StepHeader, StepContent } from "../step_ui/index";
import { t } from "../../i18next_wrapper";

export function TileSendMessage(props: StepParams) {
  if (props.currentStep.kind === "send_message") {
    return <RefactoredSendMessage
      currentStep={props.currentStep}
      currentSequence={props.currentSequence}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources}
      confirmStepDeletion={props.confirmStepDeletion} />;
  } else {
    throw new Error("TileSendMessage expects send_message");
  }
}

export interface SendMessageParams {
  currentStep: SendMessage;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  confirmStepDeletion: boolean;
}

export class RefactoredSendMessage
  extends React.Component<SendMessageParams, {}> {
  get currentSelection() {
    return MESSAGE_STATUSES_DDI[this.props.currentStep.args.message_type];
  }

  get channels() {
    return (this.props.currentStep.body || []).map(x => x.args.channel_name);
  }

  hasChannel = (channelName: ChannelName) => {
    return this.channels.includes(channelName);
  }

  add = (channelName: ChannelName) => (s: SendMessage) => {
    s.body = s.body || [];
    s.body.push(channel(channelName));
  }

  remove = (channelName: ChannelName) => (s: SendMessage) => {
    s.body = (s.body || []).filter(x => x.args.channel_name !== channelName);
  }

  toggle = (n: ChannelName) => () => {
    this.props.dispatch(editStep({
      sequence: this.props.currentSequence,
      step: this.props.currentStep,
      index: this.props.index,
      executor: this.hasChannel(n) ? this.remove(n) : this.add(n)
    }));
  }

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

  render() {
    const { dispatch, index, currentStep, currentSequence } = this.props;
    const className = "send-message-step";

    return <StepWrapper>
      <StepHeader
        className={className}
        helpText={t(ToolTips.SEND_MESSAGE)}
        currentSequence={currentSequence}
        currentStep={currentStep}
        dispatch={dispatch}
        index={index}
        confirmStepDeletion={this.props.confirmStepDeletion} />
      <StepContent className={className}>
        <Row>
          <Col xs={12}>
            <label>{t("Message")}</label>
            <span className="char-limit">
              {this.props.currentStep.args.message.length}/300
                </span>
            <StepInputBox dispatch={dispatch}
              step={currentStep}
              sequence={currentSequence}
              index={index}
              field="message" />
            <div className="bottom-content">
              <div className="channel-options">
                <label>{t("type")}</label>
                <FBSelect
                  onChange={this.setMsgType}
                  selectedItem={this.currentSelection}
                  list={MESSAGE_STATUSES} />
              </div>
              <div className="channel-fields">
                {EACH_CHANNEL.map((chan, inx) => {
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
          </Col>
        </Row>
      </StepContent>
    </StepWrapper>;
  }
}
