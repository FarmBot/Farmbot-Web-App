jest.mock("../../../devices/actions", () => ({ changeStepSize: jest.fn() }));

import React from "react";
import { shallow } from "enzyme";
import { StepSizeSelector } from "../step_size_selector";
import { changeStepSize } from "../../../devices/actions";
import { StepSizeSelectorProps } from "../interfaces";

describe("<StepSizeSelector />", () => {
  const fakeProps = (): StepSizeSelectorProps => ({
    dispatch: jest.fn(),
    selected: 5,
  });

  it("calls changeStepSize", () => {
    const wrapper = shallow(<StepSizeSelector {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(5);
    buttons.first().simulate("click");
    expect(changeStepSize).toHaveBeenCalledWith(1);
  });
});
