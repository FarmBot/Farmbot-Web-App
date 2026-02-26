let mockStep = {} as SendMessage;

import React from "react";
import { TileSendMessage } from "../tile_send_message";
import { render } from "@testing-library/react";
import { SendMessage, Channel } from "farmbot";
import { channel } from "../tile_send_message_support";
import { MessageType, StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import * as crud from "../../../api/crud";

let editStepSpy: jest.SpyInstance;

beforeEach(() => {
  editStepSpy = jest.spyOn(crud, "editStep")
    .mockImplementation(jest.fn(x => x.executor(mockStep)));
});

afterEach(() => {
  editStepSpy.mockRestore();
});

describe("<TileSendMessage/>", () => {
  const fakeProps = (): StepParams<SendMessage> => {
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
      ...fakeStepParams(currentStep),
    };
  };

  it("renders inputs", () => {
    const { container } = render(<TileSendMessage {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    expect(inputs.length).toBeGreaterThanOrEqual(4);
    expect(labels.length).toEqual(6);
    expect(labels[0]?.textContent).toEqual("Message");
    expect(labels[1]?.textContent).toEqual("type");
    const instance = new TileSendMessage(fakeProps());
    expect(instance.currentSelection.label).toMatch(/info/i);
    expect(labels[2]?.textContent).toEqual("Ticker Notification");
    const ticker = container.querySelector("input[name='ticker']");
    const toast = container.querySelector("input[name='toast']");
    const email = container.querySelector("input[name='email']");
    const speak = container.querySelector("input[name='espeak']");
    expect(ticker?.checked).toBeTruthy();
    expect(ticker?.disabled).toBeTruthy();
    expect(labels[3]?.textContent).toEqual("Toast Pop Up");
    expect(toast?.checked).toBeTruthy();
    expect(toast?.disabled).toBeFalsy();
    expect(labels[4]?.textContent).toEqual("Email");
    expect(email?.checked).toBeFalsy();
    expect(email?.disabled).toBeFalsy();
    expect(labels[5]?.textContent).toEqual("Speak");
    expect(speak?.checked).toBeFalsy();
    expect(speak?.disabled).toBeFalsy();
  });

  it("creates a channel via helpers", () => {
    const chan: Channel = { kind: "channel", args: { channel_name: "email" } };
    expect(channel("email")).toEqual(chan);
  });

  it("adds and removes channels", () => {
    const i = new TileSendMessage(fakeProps());
    const addEmail = i.add("email");
    const removeEmail = i.remove("email");
    const { currentStep } = i.props;
    addEmail(currentStep);
    expect(currentStep.body).toContainEqual(channel("email"));
    removeEmail(currentStep);
    expect(currentStep.body).not.toContainEqual(channel("email"));
  });

  it("handles missing channels while removing channel", () => {
    const p = fakeProps();
    p.currentStep.body = undefined;
    const tile = new TileSendMessage(p);
    tile.remove("email")(tile.props.currentStep);
    expect(tile.props.currentStep.body).not.toContainEqual(channel("email"));
  });

  it("adds and removes channels via toggle", () => {
    const i = new TileSendMessage(fakeProps());
    delete i.props.currentStep.body;
    mockStep = i.props.currentStep;
    i.toggle("email")();
    expect(mockStep.body).toContainEqual(channel("email"));
    i.toggle("email")();
    expect(mockStep.body).not.toContainEqual(channel("email"));
  });

  it("sets message type", () => {
    const i = new TileSendMessage(fakeProps());
    mockStep = i.props.currentStep;
    i.setMsgType({ label: "", value: "fun" });
    expect(mockStep.args.message_type).toEqual("fun");
  });

  it("doesn't set incorrect message type", () => {
    const i = new TileSendMessage(fakeProps());
    mockStep = i.props.currentStep;
    expect(() => i.setMsgType({ label: "", value: "nope" }))
      .toThrow("message_type must be one of ALLOWED_MESSAGE_TYPES.");
  });

  it("updates message", () => {
    const instance = new TileSendMessage(fakeProps());
    instance.setState = jest.fn((update: { message: string }) => {
      instance.state = { ...instance.state, ...update };
    }) as unknown as typeof instance.setState;
    expect(instance.state.message).toEqual("send this message");
    instance.updateMessage("k", "new");
    expect(instance.state.message).toEqual("new");
  });
});
