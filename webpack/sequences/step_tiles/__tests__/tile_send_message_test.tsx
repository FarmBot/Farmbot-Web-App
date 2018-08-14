import * as React from "react";
import { TileSendMessage, RefactoredSendMessage } from "../tile_send_message";
import { mount, CommonWrapper } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { SendMessage, Channel } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";
import { channel } from "../tile_send_message_support";

describe("<TileSendMessage/>", () => {
  function props() {
    const currentStep: SendMessage = {
      kind: "send_message",
      args: {
        message: "send this message",
        message_type: "info"
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
    };
  }

  function bootstrapTest() {
    return {
      component: mount(<TileSendMessage {...props()} />)
    };
  }

  it("renders inputs", () => {
    const block = bootstrapTest().component;
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(5);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Send Message");
    expect(labels.at(0).text()).toEqual("Message");
    expect(inputs.at(1).props().value).toEqual("send this message");
    expect(buttons.at(0).text()).toEqual("Info");
    expect(labels.at(1).text()).toEqual("Ticker Notification");
    expect(inputs.at(2).props().checked).toBeTruthy();
    expect(inputs.at(2).props().disabled).toBeTruthy();
    expect(labels.at(2).text()).toEqual("Toast Pop Up");
    expect(inputs.at(3).props().checked).toBeTruthy();
    expect(inputs.at(3).props().disabled).toBeFalsy();
    expect(labels.at(3).text()).toEqual("Email");
    expect(inputs.at(4).props().checked).toBeFalsy();
    expect(inputs.at(4).props().disabled).toBeFalsy();
    expect(labels.at(4).text()).toEqual("Speak");
    expect(inputs.at(5).props().checked).toBeFalsy();
    expect(inputs.at(5).props().disabled).toBeFalsy();
  });

  it("creates a channel via helpers", () => {
    const chan: Channel = { kind: "channel", args: { channel_name: "email" } };
    expect(channel("email")).toEqual(chan);
  });

  it("adds and removes channels", () => {
    const i = new RefactoredSendMessage(props());
    const addEmail = i.add("email");
    const removeEmail = i.remove("email");
    const { currentStep } = i.props;
    currentStep.body = [];
    addEmail(currentStep);
    expect(currentStep.body).toContainEqual(channel("email"));
    removeEmail(currentStep);
    expect(currentStep.body).not.toContainEqual(channel("email"));
  });
});
