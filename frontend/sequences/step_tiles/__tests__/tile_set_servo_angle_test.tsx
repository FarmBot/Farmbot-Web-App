import * as React from "react";
import { TileSetServoAngle } from "../tile_set_servo_angle";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { SetServoAngle } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileSetServoAngle/>", () => {
  const currentStep: SetServoAngle = {
    kind: "set_servo_angle",
    args: {
      pin_number: 4,
      pin_value: 90,
    }
  };

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
  });

  it("renders inputs", () => {
    const block = mount(<TileSetServoAngle {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(4);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Set Servo Angle");
    expect(labels.at(0).text()).toContain("Servo pin");
    expect(inputs.at(1).props().value).toEqual("4");
  });
});
