import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
    const { container } = render(<StepSizeSelector {...fakeProps()} />);
    expect(container.querySelectorAll("button").length).toBe(5);
    fireEvent.click(screen.getByText("1"));
    expect(deviceActions.changeStepSize).toHaveBeenCalledWith(1);
  });
});
