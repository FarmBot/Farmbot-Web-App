jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { StepRadio, StepRadioProps } from "../step_radio";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { FindHome, Calibrate, Zero } from "farmbot";
import { overwrite } from "../../../api/crud";

describe("<StepRadio />", () => {
  const currentStep: FindHome = {
    kind: "find_home",
    args: {
      speed: 100,
      axis: "x"
    }
  };

  const fakeProps = (): StepRadioProps => ({
    currentSequence: fakeSequence(),
    currentStep,
    dispatch: jest.fn(),
    index: 0,
    label: "Find",
  });

  it("renders", () => {
    const wrapper = mount(<StepRadio {...fakeProps()} />);
    expect(wrapper.find("input").length).toEqual(4);
    expect(wrapper.text()).toContain("Find");
  });

  it("handles update for find_home", () => {
    const p = fakeProps();
    const wrapper = mount(<StepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
    const expectedStep: FindHome = {
      kind: "find_home",
      args: { speed: 100, axis: "all" }
    };
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence,
      expect.objectContaining({ body: [expectedStep] }));
  });

  it("handles update for calibrate", () => {
    const p = fakeProps();
    p.currentStep = { kind: "calibrate", args: { axis: "x" } };
    const wrapper = mount(<StepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
    const expectedStep: Calibrate = {
      kind: "calibrate",
      args: { axis: "all" }
    };
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence,
      expect.objectContaining({ body: [expectedStep] }));
  });

  it("handles update for zero", () => {
    const p = fakeProps();
    p.currentStep = { kind: "zero", args: { axis: "x" } };
    const wrapper = mount(<StepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
    const expectedStep: Zero = {
      kind: "zero",
      args: { axis: "all" }
    };
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence,
      expect.objectContaining({ body: [expectedStep] }));
  });
});
