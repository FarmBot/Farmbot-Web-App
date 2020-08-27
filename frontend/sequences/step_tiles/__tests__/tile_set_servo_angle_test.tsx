jest.mock("../../../api/crud", () => ({ editStep: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import {
  TileSetServoAngle, pinNumberChanger, createServoEditFn, ServoPinSelection,
} from "../tile_set_servo_angle";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { SetServoAngle } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("<TileSetServoAngle/>", () => {
  const fakeProps = (): StepParams<SetServoAngle> => ({
    currentSequence: fakeSequence(),
    currentStep: {
      kind: "set_servo_angle",
      args: {
        pin_number: 4,
        pin_value: 90,
      }
    },
    dispatch: mockDispatch(),
    index: 0,
    resources: emptyState().index,
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
    expect(labels.at(0).text()).toContain("Angle (0-180)");
    expect(inputs.at(1).props().value).toEqual(stepArgs.pin_value);
    expect(inputs.at(2).props().value).toEqual("" + stepArgs.pin_number);
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
    expect(() => ServoPinSelection(p)).toThrowError();
  });

  it("creates a servo edit function", () => {
    const p = fakeProps();
    p.currentStep.args.pin_number = 1;
    createServoEditFn("4")(p.currentStep);
    expect(p.currentStep.args.pin_number).toEqual(4);
  });
});
