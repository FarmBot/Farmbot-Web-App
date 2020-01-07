let mockStep = {};
jest.mock("../../../api/crud", () => ({
  editStep: jest.fn(x => x.executor(mockStep)),
}));

import * as React from "react";
import { mount } from "enzyme";
import { AxisStepRadio, AxisStepRadioProps } from "../step_radio";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { FindHome, Calibrate, Zero } from "farmbot";

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
    label: "Find",
  });

  it("renders", () => {
    const wrapper = mount(<AxisStepRadio {...fakeProps()} />);
    expect(wrapper.find("input").length).toEqual(4);
    expect(wrapper.text()).toContain("Find");
  });

  it("handles update for find_home", () => {
    const p = fakeProps();
    mockStep = p.currentStep;
    const wrapper = mount(<AxisStepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
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
    const wrapper = mount(<AxisStepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
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
    const wrapper = mount(<AxisStepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
    const expectedStep: Zero = {
      kind: "zero",
      args: { axis: "all" }
    };
    expect(mockStep).toEqual(expectedStep);
  });
});
