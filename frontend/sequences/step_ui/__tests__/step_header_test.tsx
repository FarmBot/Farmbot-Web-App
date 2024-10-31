jest.mock("../../request_auto_generation", () => ({
  requestAutoGeneration: jest.fn(),
  PLACEHOLDER_PROMPTS: ["1", "2", "3"],
  retrievePrompt: () => "",
}));

import React from "react";
import { mount } from "enzyme";
import { StepHeader, StepHeaderProps } from "../step_header";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { API } from "../../../api";
import { requestAutoGeneration } from "../../request_auto_generation";
import { emptyState } from "../../../resources/reducer";

describe("<StepHeader />", () => {
  API.setBaseUrl("");

  const fakeProps = (): StepHeaderProps => ({
    className: "step-class",
    helpText: "help text",
    currentSequence: fakeSequence(),
    currentStep: { kind: "take_photo", args: {} },
    dispatch: jest.fn(),
    readOnly: false,
    index: 0,
    executeSequence: undefined,
    viewRaw: undefined,
    toggleViewRaw: undefined,
    links: undefined,
    children: "child",
    confirmStepDeletion: false,
    setKey: jest.fn(),
    sequencesState: emptyState().consumers.sequences,
  });

  it("renders", () => {
    const wrapper = mount(<StepHeader {...fakeProps()} />);
    const div = wrapper.find("div").at(1);
    expect(div.hasClass("step-header")).toBeTruthy();
    expect(div.hasClass("step-class")).toBeTruthy();
  });

  it("renders with children", () => {
    const wrapper = mount(<StepHeader {...fakeProps()} />);
    expect(wrapper.text()).toContain("child");
  });

  it("renders pinned sequence", () => {
    const p = fakeProps();
    p.executeSequence = fakeSequence().body;
    p.executeSequence.color = "red";
    p.executeSequence.name = "Pinned Sequence";
    const wrapper = mount(<StepHeader {...p} />);
    const step = wrapper.find("div").first();
    expect(step.find(".step-header").hasClass("red")).toBeTruthy();
    expect(wrapper.html().toLowerCase()).toContain("pinned");
  });

  it("toggle draggable", () => {
    const wrapper = mount<StepHeader>(<StepHeader {...fakeProps()} />);
    expect(wrapper.state().draggable).toEqual(true);
    wrapper.instance().toggle("enter")();
    expect(wrapper.state().draggable).toEqual(false);
    wrapper.instance().toggle("leave")();
    expect(wrapper.state().draggable).toEqual(true);
  });

  it("toggles prompt", () => {
    const wrapper = mount<StepHeader>(<StepHeader {...fakeProps()} />);
    expect(wrapper.state().promptOpen).toEqual(false);
    wrapper.instance().togglePrompt();
    expect(wrapper.state().promptOpen).toEqual(true);
    wrapper.instance().togglePrompt();
    expect(wrapper.state().promptOpen).toEqual(false);
  });

  it("prompt succeeds", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    const wrapper = mount<StepHeader>(<StepHeader {...p} />);
    expect(wrapper.state().promptText).toEqual("");
    expect(wrapper.state().isProcessing).toEqual(false);
    const prompt = mount(wrapper.instance().AutoLuaPrompt());
    prompt.find("textarea").simulate("change",
      { currentTarget: { value: "write" } });
    expect(prompt.text()).toContain("generate code");
    prompt.find("button").simulate("click");
    expect(wrapper.state().isProcessing).toEqual(true);
    expect(requestAutoGeneration).toHaveBeenCalled();
    const { mock } = requestAutoGeneration as jest.Mock;
    mock.calls[0][0].onUpdate("code");
    expect(p.setKey).toHaveBeenCalledWith("code");
    mock.calls[0][0].onSuccess("code");
    jest.runAllTimers();
    expect(p.setKey).toHaveBeenCalledWith("code success");
    mock.calls[0][0].onError();
    expect(wrapper.state().isProcessing).toEqual(false);
  });

  it("renders while in progress", () => {
    const p = fakeProps();
    const wrapper = mount<StepHeader>(<StepHeader {...p} />);
    wrapper.setState({ isProcessing: true });
    const prompt = mount(wrapper.instance().AutoLuaPrompt());
    expect(prompt.text()).toContain("generating");
  });

  it.each<[string, string]>([
    ["good", "fa-thumbs-up"],
    ["bad", "fa-thumbs-down"],
  ])("shows feedback: %s", (reaction, expected) => {
    const wrapper = mount<StepHeader>(<StepHeader {...fakeProps()} />);
    wrapper.setState({
      cachedPrompt: "write code", showFeedback: true, reaction,
    });
    const prompt = mount(wrapper.instance().AutoLuaPrompt());
    expect(prompt.html()).toContain(expected);
  });

  it("submits feedback", () => {
    jest.useFakeTimers();
    const wrapper = mount<StepHeader>(<StepHeader {...fakeProps()} />);
    wrapper.setState({
      cachedPrompt: "write code", showFeedback: true, reaction: "good",
    });
    wrapper.instance().submitFeedback("write code", "good")();
    jest.runAllTimers();
    expect(wrapper.state().cachedPrompt).toEqual("");
    expect(wrapper.state().showFeedback).toEqual(false);
    expect(wrapper.state().reaction).toEqual(undefined);
  });
});
