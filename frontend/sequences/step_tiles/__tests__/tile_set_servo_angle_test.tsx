jest.mock("../../../api/crud", () => ({ editStep: jest.fn() }));

import React from "react";
import { render } from "@testing-library/react";
import {
  TileSetServoAngle, pinNumberChanger, createServoEditFn, ServoPinSelection,
} from "../tile_set_servo_angle";
import { SetServoAngle } from "farmbot";
import { StepParams } from "../../interfaces";
import { editStep } from "../../../api/crud";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
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
    const { container } = render(<TileSetServoAngle {...props} />);
    const inputs = container.querySelectorAll("input");
    const labels = container.querySelectorAll("label");
    const stepArgs = props.currentStep.args;
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(6);
    expect(inputs[0]?.getAttribute("placeholder")).toEqual("Control Servo");
    expect((inputs[1] as HTMLInputElement | undefined)?.value)
      .toEqual("" + stepArgs.pin_number);
    expect(labels[5]?.textContent).toContain("Angle (0-180)");
    expect((inputs[5] as HTMLInputElement | undefined)?.value)
      .toEqual("" + stepArgs.pin_value);
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
