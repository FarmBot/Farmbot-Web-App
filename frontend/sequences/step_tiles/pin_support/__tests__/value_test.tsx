const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({
  editStep: mockEditStep
}));

import React from "react";
import { shallow, mount } from "enzyme";
import { WritePin } from "farmbot";
import {
  PinValueField, PinValueFieldProps, PIN_VALUES, currentValueSelection,
  setPinValue,
  setPinValueFromDdi,
} from "../value";
import { FBSelect } from "../../../../ui";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";
import { Slider } from "@blueprintjs/core";

describe("<PinValueField />", () => {
  const fakeProps = (): PinValueFieldProps => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 2, pin_mode: 1 }
    };
    return {
      ...fakeStepParams(step),
    };
  };

  it("changes digital pin value", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 0;
    p.currentStep.args.pin_value = 1;
    const pinValueSelect = shallow(<PinValueField {...p} />);
    pinValueSelect.find(FBSelect).last().simulate("change", {
      label: "123", value: 123
    });
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep.args.pin_value).toEqual(123);
  });

  it("changes analog pin value", () => {
    const p = fakeProps();
    p.currentStep.args.pin_mode = 1;
    p.currentStep.args.pin_value = 1;
    const wrapper = mount(<PinValueField {...p} />);
    const pinValueSelect =
      shallow(<div>{wrapper.find(Slider).getElement()}</div>);
    pinValueSelect.find(Slider).simulate("change", 2);
    mockEditStep.mock.calls[0][0].executor(p.currentStep);
    expect(p.currentStep.args.pin_value).toEqual(2);
  });
});

describe("PIN_VALUES()", () => {
  it("returns pin value list", () => {
    expect(PIN_VALUES()[0].value).toEqual(1);
    expect(PIN_VALUES()[0].label).toEqual("ON");
  });
});

describe("currentValueSelection()", () => {
  it("gets current value", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 2, pin_mode: 1 }
    };
    step.args.pin_value = 0;
    const results = currentValueSelection(step);
    expect(results.label).toEqual("OFF");
    expect(results.value).toEqual(0);
  });
});

describe("setPinValue()", () => {
  it("sets pin value", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 5, pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    setPinValue(1, p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_value).toEqual(1);
  });
});

describe("setPinValueFromDdi()", () => {
  it("sets pin value", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 5, pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    setPinValueFromDdi(PIN_VALUES()[0], p);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.pin_value).toEqual(1);
  });

  it("rejects typos", () => {
    const step: WritePin = {
      kind: "write_pin",
      args: { pin_number: 3, pin_value: 5, pin_mode: 0 }
    };
    const p = fakeStepParams(step);
    const action = () => setPinValueFromDdi({ label: "", value: "bad" }, p);
    expect(action).toThrow("Numbers only in pin_value.");
  });
});
