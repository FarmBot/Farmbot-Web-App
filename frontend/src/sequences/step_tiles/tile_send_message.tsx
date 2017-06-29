import * as React from "react";
import { splice, remove } from "./index";
import { StepTitleBar } from "./step_title_bar";
import { Help, DropDownItem } from "../../ui";
import { t } from "i18next";
import { StepInputBox } from "../inputs/step_input_box";
import { SendMessage, ALLOWED_CHANNEL_NAMES } from "farmbot";
import * as _ from "lodash";
import { StepParams } from "../interfaces";
import { TaggedSequence } from "../../resources/tagged_resources";
import { ResourceIndex } from "../../resources/interfaces";
import { editStep } from "../../api/crud";
import { FBSelect } from "../../ui/new_fb_select";
import { ToolTips } from "../../constants";
import {
  MESSAGE_STATUSES,
  EACH_CHANNEL,
  channel
} from "./tile_send_message_support";
type ChannelName = ALLOWED_CHANNEL_NAMES;
export function TileSendMessage(props: StepParams) {
  if (props.currentStep.kind === "send_message") {
    return <RefactoredSendMessage
      currentStep={props.currentStep}
      currentSequence={props.currentSequence}
      dispatch={props.dispatch}
      index={props.index}
      resources={props.resources} />;
  } else {
    throw new Error("TileSendMessage expects send_message");
  }
}

interface SendMessageParams {
  currentStep: SendMessage;
  currentSequence: TaggedSequence;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}

class RefactoredSendMessage extends React.Component<SendMessageParams, {}> {
  get args() { return this.props.currentStep.args; }
  get message() { return this.args.message };
  get message_type() { return this.args.message_type }
  get step() { return this.props.currentStep; }
  get dispatch() { return this.props.dispatch }
  get sequence() { return this.props.currentSequence; }
  get index() { return this.props.index }
  get currentSelection() {
    return { label: _.capitalize(this.message_type), value: this.message_type };
  };
  get channels() { return (this.step.body || []).map(x => x.args.channel_name) }
  hasChannel = (name: ChannelName) => {
    return this.channels.includes(name);
  }

  add = (name: ChannelName) => (s: SendMessage) => {
    s.body = s.body || [];
    s.body.push(channel(name));
  }

  remove = (name: ChannelName) => (s: SendMessage) => {
    s.body = (s.body || []).filter(x => x.args.channel_name !== name);
  }

  toggle = (n: ChannelName) => () => {
    this.dispatch(editStep({
      sequence: this.sequence,
      step: this.step,
      index: this.index,
      executor: this.hasChannel(n) ? this.remove(n) : this.add(n)
    }));
  }

  setMsgType = (x: DropDownItem) => {
    this.dispatch(editStep({
      sequence: this.sequence,
      step: this.step,
      index: this.index,
      executor: (step: SendMessage) => {
        if (_.isString(x.value)) {
          step.args.message_type = x.value
        } else {
          throw new Error("Strings only in send_message.");
        }
      }
    }));
  };

  render() {
    let { dispatch, index, currentStep, currentSequence } = this.props;

    return <div>
      <div className="step-wrapper">
        <div className="row">
          <div className="col-sm-12">
            <div className="step-header send-message-step">
              <StepTitleBar index={index}
                dispatch={dispatch}
                step={currentStep} />
              <i className="fa fa-arrows-v step-control" />
              <i className="fa fa-clone step-control"
                onClick={() => dispatch(splice({
                  step: currentStep,
                  sequence: currentSequence,
                  index
                }))} />
              <i className="fa fa-trash step-control"
                onClick={() => remove({ dispatch, index, sequence: currentSequence })} />
              <Help text={t(ToolTips.SEND_MESSAGE)} />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="step-content send-message-step">
              <div className="row">
                <div className="col-xs-12">
                  <label>{t("Message")}</label>
                  <span className="char-limit">
                    {this.message.length}/300
                </span>
                  <StepInputBox dispatch={dispatch}
                    step={currentStep}
                    sequence={currentSequence}
                    index={index}
                    field="message"
                  />
                  <div className="bottom-content">
                    <div className="channel-options">
                      <FBSelect
                        onChange={this.setMsgType}
                        selectedItem={this.currentSelection}
                        list={MESSAGE_STATUSES} />
                    </div>
                    <div className="channel-fields">
                      <div>{EACH_CHANNEL.map((chan, inx) => {
                        return <fieldset key={inx}>
                          <label htmlFor={chan.name}>
                            {chan.label}
                          </label>
                          <input type="checkbox"
                            id={chan.name}
                            onChange={this.toggle(chan.name)}
                            checked={this.hasChannel(chan.name) || chan.alwaysOn}
                            disabled={chan.alwaysOn} />
                        </fieldset>;
                      })}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}
