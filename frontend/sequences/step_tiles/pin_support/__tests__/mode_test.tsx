const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({
  editStep: mockEditStep
}));

import React from "react";
import { shallow } from "enzyme";
import { NamedPin, WritePin, ALLOWED_PIN_MODES, ReadPin } from "farmbot";
import {
  setPinMode, getPinModes, currentModeSelection, PinModeDropdown,
} from "../mode";
import { editStep } from "../../../../api/crud";
import { FBSelect } from "../../../../ui";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

describe("setPinMode()", () => {
  it("sets pin mode", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 0, pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    setPinMode(getPinModes()[0], p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_mode).toEqual(1);
    expect(step.args.pin_value).toEqual(0);
  });

  it("adjusts value for mode: digital", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 128, pin_mode: 1 }
    };
    const p = fakeStepParams(step);
    setPinMode(getPinModes()[1], p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_mode).toEqual(0);
    expect(step.args.pin_value).toEqual(1);
  });

  it("doesn't adjust value for mode: digital", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 0, pin_mode: 1 }
    };
    const p = fakeStepParams(step);
    setPinMode(getPinModes()[1], p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_mode).toEqual(0);
    expect(step.args.pin_value).toEqual(0);
  });

  it("adjusts value for mode: analog", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 1, pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    setPinMode(getPinModes()[0], p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_mode).toEqual(1);
    expect(step.args.pin_value).toEqual(255);
  });

  it("doesn't adjust value for mode: analog", () => {
    const step: ReadPin = {
      kind: "read_pin",
      args: { pin_number: 3, label: "", pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    setPinMode(getPinModes()[0], p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_mode).toEqual(1);
    expect(step.args["pin_value" as keyof ReadPin["args"]]).toEqual(undefined);
  });

  it("rejects typos", () => {
    const step: ReadPin = {
      kind: "read_pin",
      args: { pin_number: 3, label: "", pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    setPinMode({
      label: "",
      value: "bad" as unknown as ALLOWED_PIN_MODES
    }, p);
    const action = () => mockEditStep.mock.calls[0][0].executor(step);
    expect(action).toThrow("pin_mode must be one of ALLOWED_PIN_MODES.");
  });
});

describe("currentModeSelection()", () => {
  it("gets current mode", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 1, pin_mode: 1 }
    };
    const results = currentModeSelection(step);
    expect(results.label).toEqual("Analog");
    expect(results.value).toEqual(1);
  });
});

describe("getPinModes()", () => {
  it("returns pin mode list: all", () => {
    expect(getPinModes()[0].value).toEqual(1);
    expect(getPinModes()[0].label).toEqual("Analog");
    expect(getPinModes().length).toEqual(2);
  });

  it("returns pin mode list: digital only", () => {
    const pin: NamedPin = {
      kind: "named_pin",
      args: { pin_id: 1, pin_type: "BoxLed3" }
    };
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: pin, pin_mode: 0, pin_value: 1 }
    };
    expect(getPinModes(step).length).toEqual(1);
    expect(getPinModes(step)[0].label).toEqual("Digital");
  });
});

describe("<PinModeDropdown />", () => {
  it("sets pin mode", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 0, pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    const wrapper = shallow(<PinModeDropdown {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: 0 });
    expect(editStep).toHaveBeenCalled();
  });
});
