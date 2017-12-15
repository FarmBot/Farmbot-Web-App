import * as React from "react";
import { mount } from "enzyme";
import {
  StepWrapper,
  StepHeader,
  StepContent,
  StepHeaderProps
} from "../index";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<StepWrapper />", () => {
  it("renders", () => {
    const wrapper = mount(<StepWrapper />);
    expect(wrapper.find("div").hasClass("step-wrapper")).toBeTruthy();
  });

  it("renders with extra className", () => {
    const wrapper = mount(<StepWrapper className={"step-class"} />);
    expect(wrapper.find("div").hasClass("step-class")).toBeTruthy();
  });
});

describe("<StepHeader />", () => {
  const fakeProps: StepHeaderProps = {
    className: "step-class",
    helpText: "help text",
    currentSequence: fakeSequence(),
    currentStep: { kind: "take_photo", args: {} },
    dispatch: jest.fn(),
    index: 0,
    children: "child"
  };

  it("renders", () => {
    const wrapper = mount(<StepHeader  {...fakeProps} />);
    const div = wrapper.find("div").last();
    expect(div.hasClass("step-header")).toBeTruthy();
    expect(div.hasClass("step-class")).toBeTruthy();
  });

  it("renders with children", () => {
    const wrapper = mount(<StepHeader  {...fakeProps} />);
    expect(wrapper.text()).toContain("child");
  });
});

describe("<StepContent />", () => {
  it("renders", () => {
    const wrapper = mount(<StepContent className={"step-class"} />);
    const div = wrapper.find("div").last();
    expect(div.hasClass("step-content")).toBeTruthy();
    expect(div.hasClass("step-class")).toBeTruthy();
  });
});
