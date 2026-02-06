import React from "react";
import { mount } from "enzyme";
import { StepButtonParams } from "../interfaces";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { error } from "../../toast/toast";
import * as sequenceActions from "../actions";
import { Path } from "../../internal_urls";
import { StepButton } from "../step_buttons";

let pushStepSpy: jest.SpyInstance;
let closeCommandMenuSpy: jest.SpyInstance;

beforeEach(() => {
  pushStepSpy = jest.spyOn(sequenceActions, "pushStep")
    .mockImplementation(jest.fn());
  closeCommandMenuSpy = jest.spyOn(sequenceActions, "closeCommandMenu")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  pushStepSpy.mockRestore();
  closeCommandMenuSpy.mockRestore();
});

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
    expect(sequenceActions.pushStep).toHaveBeenCalledWith(
      p.step, p.dispatch, p.current, p.index);
    expect(sequenceActions.closeCommandMenu).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("doesn't edit sequence", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = mount(<StepButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(error).toHaveBeenCalledWith("Select a sequence first");
    expect(sequenceActions.pushStep).not.toHaveBeenCalled();
    expect(sequenceActions.closeCommandMenu).toHaveBeenCalled();
  });

  it("renders in designer", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const wrapper = mount(<StepButton {...fakeProps()} />);
    expect(wrapper.html()).toContain("clustered");
  });
});
