let mockStep = {};
jest.mock("../../../api/crud", () => ({
  editStep: jest.fn(x => x.executor(mockStep)),
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { AxisStepRadio, AxisStepRadioProps } from "../step_radio";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { FindHome, Calibrate, Zero } from "farmbot";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<StepRadio />", () => {
  const findHomeStep: FindHome = {
    kind: "find_home",
    args: {
      speed: 100,
      axis: "x"
    }
  };

  const fakeProps = (): AxisStepRadioProps => ({
    currentSequence: fakeSequence(),
    currentStep: findHomeStep,
    dispatch: jest.fn(),
    index: 0,
  });

  it("renders", () => {
    const { container } = render(<AxisStepRadio {...fakeProps()} />);
    expect(container.querySelectorAll("input").length).toEqual(4);
    expect(container.textContent).toContain("all");
  });

  it("handles update for find_home", () => {
    const p = fakeProps();
    mockStep = p.currentStep;
    const { container } = render(<AxisStepRadio {...p} />);
    const inputs = container.querySelectorAll("input");
    fireEvent.click(inputs[inputs.length - 1] as Element);
    const expectedStep: FindHome = {
      kind: "find_home",
      args: { speed: 100, axis: "all" }
    };
    expect(mockStep).toEqual(expectedStep);
  });

  it("handles update for calibrate", () => {
    const p = fakeProps();
    p.currentStep = { kind: "calibrate", args: { axis: "x" } };
    mockStep = p.currentStep;
    const { container } = render(<AxisStepRadio {...p} />);
    const inputs = container.querySelectorAll("input");
    fireEvent.click(inputs[inputs.length - 1] as Element);
    const expectedStep: Calibrate = {
      kind: "calibrate",
      args: { axis: "all" }
    };
    expect(mockStep).toEqual(expectedStep);
  });

  it("handles update for zero", () => {
    const p = fakeProps();
    p.currentStep = { kind: "zero", args: { axis: "x" } };
    mockStep = p.currentStep;
    const { container } = render(<AxisStepRadio {...p} />);
    const inputs = container.querySelectorAll("input");
    fireEvent.click(inputs[inputs.length - 1] as Element);
    const expectedStep: Zero = {
      kind: "zero",
      args: { axis: "all" }
    };
    expect(mockStep).toEqual(expectedStep);
  });
});
