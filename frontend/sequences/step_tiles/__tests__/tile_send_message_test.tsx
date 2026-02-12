let mockStep = {} as SendMessage;
jest.mock("../../../api/crud", () => ({
  editStep: jest.fn(x => x.executor(mockStep)),
}));

import React from "react";
import { TileSendMessage } from "../tile_send_message";
import { render } from "@testing-library/react";
import { SendMessage, Channel } from "farmbot";
import { channel } from "../tile_send_message_support";
import { MessageType, StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

afterAll(() => {
  jest.unmock("../../../api/crud");
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
    const buttons = container.querySelectorAll("button");
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(6);
    expect(buttons.length).toEqual(1);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Send Message");
    expect(labels[0]?.textContent).toEqual("Message");
    expect((inputs[1] as HTMLInputElement | undefined)?.value)
      .toEqual("send this message");
    expect(labels[1]?.textContent).toEqual("type");
    expect(buttons[0]?.textContent).toEqual("Info");
    expect(labels[2]?.textContent).toEqual("Ticker Notification");
    expect((inputs[2] as HTMLInputElement | undefined)?.checked).toBeTruthy();
    expect((inputs[2] as HTMLInputElement | undefined)?.disabled).toBeTruthy();
    expect(labels[3]?.textContent).toEqual("Toast Pop Up");
    expect((inputs[3] as HTMLInputElement | undefined)?.checked).toBeTruthy();
    expect((inputs[3] as HTMLInputElement | undefined)?.disabled).toBeFalsy();
    expect(labels[4]?.textContent).toEqual("Email");
    expect((inputs[4] as HTMLInputElement | undefined)?.checked).toBeFalsy();
    expect((inputs[4] as HTMLInputElement | undefined)?.disabled).toBeFalsy();
    expect(labels[5]?.textContent).toEqual("Speak");
    expect((inputs[5] as HTMLInputElement | undefined)?.checked).toBeFalsy();
    expect((inputs[5] as HTMLInputElement | undefined)?.disabled).toBeFalsy();
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
