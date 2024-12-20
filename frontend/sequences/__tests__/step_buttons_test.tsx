jest.mock("../actions", () => ({
  pushStep: jest.fn(),
  closeCommandMenu: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { StepButtonParams } from "../interfaces";
import { StepButton } from "../step_buttons";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { error } from "../../toast/toast";
import { closeCommandMenu, pushStep } from "../actions";
import { Path } from "../../internal_urls";

describe("<StepButton />", () => {
  const fakeProps = (): StepButtonParams => ({
    current: fakeSequence(),
    step: { kind: "wait", args: { milliseconds: 9 } },
    dispatch: jest.fn(),
    color: "blue",
    index: 1,
    label: "label",
  });

  it("edits sequence", () => {
    const p = fakeProps();
    const wrapper = mount(<StepButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(pushStep).toHaveBeenCalledWith(p.step, p.dispatch, p.current, p.index);
    expect(closeCommandMenu).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't edit sequence", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = mount(<StepButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(error).toHaveBeenCalledWith("Select a sequence first");
    expect(pushStep).not.toHaveBeenCalled();
    expect(closeCommandMenu).toHaveBeenCalled();
  });

  it("renders in designer", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const wrapper = mount(<StepButton {...fakeProps()} />);
    expect(wrapper.html()).toContain("clustered");
  });
});
