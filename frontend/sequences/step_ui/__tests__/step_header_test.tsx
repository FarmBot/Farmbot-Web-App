import React from "react";
import { mount } from "enzyme";
import { StepHeader, StepHeaderProps } from "../step_header";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<StepHeader />", () => {
  const fakeProps = (): StepHeaderProps => ({
    className: "step-class",
    helpText: "help text",
    currentSequence: fakeSequence(),
    currentStep: { kind: "take_photo", args: {} },
    dispatch: jest.fn(),
    index: 0,
    children: "child",
    confirmStepDeletion: false,
  });

  it("renders", () => {
    const wrapper = mount(<StepHeader {...fakeProps()} />);
    const div = wrapper.find("div").at(2);
    expect(div.hasClass("step-header")).toBeTruthy();
    expect(div.hasClass("step-class")).toBeTruthy();
  });

  it("renders with children", () => {
    const wrapper = mount(<StepHeader {...fakeProps()} />);
    expect(wrapper.text()).toContain("child");
  });

  it("toggle draggable", () => {
    const wrapper = mount<StepHeader>(<StepHeader {...fakeProps()} />);
    expect(wrapper.state().draggable).toEqual(true);
    wrapper.instance().toggle("enter")();
    expect(wrapper.state().draggable).toEqual(false);
    wrapper.instance().toggle("leave")();
    expect(wrapper.state().draggable).toEqual(true);
  });
});
