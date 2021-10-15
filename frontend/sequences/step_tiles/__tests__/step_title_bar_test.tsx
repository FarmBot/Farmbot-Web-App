import React from "react";
import { StepTitleBar } from "../step_title_bar";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Wait } from "farmbot";
import { StepTitleBarProps } from "../../interfaces";
import { FarmwareName } from "../tile_execute_script";

describe("<StepTitleBar/>", () => {
  const currentStep: Wait = { kind: "wait", args: { milliseconds: 100 } };

  const fakeProps = (): StepTitleBarProps => ({
    step: currentStep,
    index: 0,
    dispatch: jest.fn(),
    readOnly: false,
    sequence: fakeSequence(),
    pinnedSequenceName: undefined,
    toggleDraggable: jest.fn(),
  });

  it("title has placeholder, no value", () => {
    const p = fakeProps();
    const block = mount(<StepTitleBar {...p} />);
    const inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    const title = inputs.first();
    expect(title.props().value).toEqual("");
    expect(title.props().placeholder).toEqual("Wait");
    title.simulate("blur");
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("title uses placeholder", () => {
    const p = fakeProps();
    p.step = {
      kind: "execute_script",
      args: { label: FarmwareName.MeasureSoilHeight },
    };
    const block = mount(<StepTitleBar {...p} />);
    const titleProps = block.find("input").first().props();
    expect(titleProps.value).toEqual("");
    expect(titleProps.placeholder).toEqual("MEASURE SOIL HEIGHT");
  });

  it("title has value", () => {
    const p = fakeProps();
    p.step.comment = "new title";
    const block = mount(<StepTitleBar {...p} />);
    const inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    const title = inputs.first();
    expect(title.props().value).toEqual("new title");
  });

  it("calls enter action", () => {
    const p = fakeProps();
    const block = mount(<StepTitleBar {...p} />);
    block.simulate("mouseEnter");
    expect(p.toggleDraggable).toHaveBeenCalledWith("enter");
  });

  it("calls leave action", () => {
    const p = fakeProps();
    const block = mount(<StepTitleBar {...p} />);
    block.simulate("mouseEnter");
    expect(p.toggleDraggable).toHaveBeenCalledWith("leave");
  });
});
