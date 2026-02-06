import React from "react";
import { shallow } from "enzyme";
import { StepSizeSelector } from "../step_size_selector";
import * as deviceActions from "../../../devices/actions";
import { StepSizeSelectorProps } from "../interfaces";

describe("<StepSizeSelector />", () => {
  let changeStepSizeSpy: jest.SpyInstance;

  beforeEach(() => {
    changeStepSizeSpy =
      jest.spyOn(deviceActions, "changeStepSize").mockImplementation(jest.fn());
  });

  afterEach(() => {
    changeStepSizeSpy.mockRestore();
  });

  const fakeProps = (): StepSizeSelectorProps => ({
    dispatch: jest.fn(),
    selected: 5,
  });

  it("calls changeStepSize", () => {
    const wrapper = shallow(<StepSizeSelector {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toBe(5);
    buttons.first().simulate("click");
    expect(deviceActions.changeStepSize).toHaveBeenCalledWith(1);
  });
});
