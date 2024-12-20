jest.mock("../../../api/crud", () => ({ editStep: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import {
  TileSetServoAngle, pinNumberChanger, createServoEditFn, ServoPinSelection,
} from "../tile_set_servo_angle";
import { SetServoAngle } from "farmbot";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileSetServoAngle/>", () => {
  const fakeProps = (): StepParams<SetServoAngle> => ({
    ...fakeStepParams({
      kind: "set_servo_angle",
      args: {
        pin_number: 4,
        pin_value: 90,
      }
    }),
    dispatch: mockDispatch(),
  });

  it("renders inputs", () => {
    const props = fakeProps();
    const block = mount(<TileSetServoAngle {...props} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    const stepArgs = props.currentStep.args;
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(6);
    expect(inputs.first().props().placeholder).toEqual("Control Servo");
    expect(inputs.at(1).props().value).toEqual("" + stepArgs.pin_number);
    expect(labels.at(5).text()).toContain("Angle (0-180)");
    expect(inputs.at(5).props().value).toEqual(stepArgs.pin_value);
  });

  it("changes pin number", () => {
    const p = fakeProps();
    pinNumberChanger(p)("5");
    expect(editStep).toHaveBeenCalledWith({
      step: p.currentStep,
      sequence: p.currentSequence,
      index: p.index,
      executor: expect.any(Function)
    });
  });

  it("disallows named_pins", () => {
    const p = fakeProps();
    p.currentStep.args.pin_number = {
      kind: "named_pin",
      args: { pin_id: 0, pin_type: "Peripheral" }
    };
    expect(() => ServoPinSelection(p)).toThrow();
  });

  it("creates a servo edit function", () => {
    const p = fakeProps();
    p.currentStep.args.pin_number = 1;
    createServoEditFn("4")(p.currentStep);
    expect(p.currentStep.args.pin_number).toEqual(4);
  });
});
