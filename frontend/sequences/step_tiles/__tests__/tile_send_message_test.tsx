let mockStep = {} as SendMessage;
jest.mock("../../../api/crud", () => ({
  editStep: jest.fn(x => x.executor(mockStep)),
}));

import * as React from "react";
import {
  TileSendMessage, RefactoredSendMessage, SendMessageParams,
} from "../tile_send_message";
import { mount, shallow } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { SendMessage, Channel } from "farmbot/dist";
import { channel } from "../tile_send_message_support";
import { emptyState } from "../../../resources/reducer";
import { MessageType } from "../../interfaces";

describe("<TileSendMessage/>", () => {
  const fakeProps = (): SendMessageParams => {
    const currentStep: SendMessage = {
      kind: "send_message",
      args: {
        message: "send this message",
        message_type: MessageType.info
      },
      body: [{
        kind: "channel",
        args: {
          channel_name: "toast"
        }
      }]
    };

    return {
      currentSequence: fakeSequence(),
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      confirmStepDeletion: false,
    };
  };

  it("throws error upon wrong step type", () => {
    const p = fakeProps();
    p.currentStep.kind = "nope" as SendMessage["kind"];
    expect(() => shallow(<TileSendMessage {...p} />))
      .toThrowError("TileSendMessage expects send_message");
  });

  it("renders inputs", () => {
    const block = mount(<TileSendMessage {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(6);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Send Message");
    expect(labels.at(0).text()).toEqual("Message");
    expect(inputs.at(1).props().value).toEqual("send this message");
    expect(labels.at(1).text()).toEqual("type");
    expect(buttons.at(0).text()).toEqual("Info");
    expect(labels.at(2).text()).toEqual("Ticker Notification");
    expect(inputs.at(2).props().checked).toBeTruthy();
    expect(inputs.at(2).props().disabled).toBeTruthy();
    expect(labels.at(3).text()).toEqual("Toast Pop Up");
    expect(inputs.at(3).props().checked).toBeTruthy();
    expect(inputs.at(3).props().disabled).toBeFalsy();
    expect(labels.at(4).text()).toEqual("Email");
    expect(inputs.at(4).props().checked).toBeFalsy();
    expect(inputs.at(4).props().disabled).toBeFalsy();
    expect(labels.at(5).text()).toEqual("Speak");
    expect(inputs.at(5).props().checked).toBeFalsy();
    expect(inputs.at(5).props().disabled).toBeFalsy();
  });

  it("creates a channel via helpers", () => {
    const chan: Channel = { kind: "channel", args: { channel_name: "email" } };
    expect(channel("email")).toEqual(chan);
  });

  it("adds and removes channels", () => {
    const i = new RefactoredSendMessage(fakeProps());
    const addEmail = i.add("email");
    const removeEmail = i.remove("email");
    const { currentStep } = i.props;
    addEmail(currentStep);
    expect(currentStep.body).toContainEqual(channel("email"));
    removeEmail(currentStep);
    expect(currentStep.body).not.toContainEqual(channel("email"));
  });

  it("adds and removes channels via toggle", () => {
    const i = new RefactoredSendMessage(fakeProps());
    delete i.props.currentStep.body;
    mockStep = i.props.currentStep;
    i.toggle("email")();
    expect(mockStep.body).toContainEqual(channel("email"));
    i.toggle("email")();
    expect(mockStep.body).not.toContainEqual(channel("email"));
  });

  it("sets message type", () => {
    const i = new RefactoredSendMessage(fakeProps());
    mockStep = i.props.currentStep;
    i.setMsgType({ label: "", value: "fun" });
    expect(mockStep.args.message_type).toEqual("fun");
  });

  it("doesn't set incorrect message type", () => {
    const i = new RefactoredSendMessage(fakeProps());
    mockStep = i.props.currentStep;
    expect(() => i.setMsgType({ label: "", value: "nope" }))
      .toThrowError("message_type must be one of ALLOWED_MESSAGE_TYPES.");
  });
});
