import * as React from "react";
import { mount } from "enzyme";
import { StepHeader, StepHeaderProps } from "..";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<StepHeader />", () => {
  const fakeProps = (): StepHeaderProps => ({
    className: "",
    helpText: "",
    currentSequence: fakeSequence(),
    currentStep: { kind: "wait", args: { milliseconds: 0 } },
    dispatch: Function,
    index: 0,
    confirmStepDeletion: false,
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
