jest.mock("../../request_auto_generation", () => ({
  requestAutoGeneration: jest.fn(),
  PLACEHOLDER_PROMPTS: ["1", "2", "3"],
  retrievePrompt: () => "",
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { StepHeader, StepHeaderProps } from "../step_header";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { API } from "../../../api";
import { requestAutoGeneration } from "../../request_auto_generation";
import { emptyState } from "../../../resources/reducer";
import axios from "axios";

let postSpy: jest.SpyInstance;

beforeEach(() => {
  postSpy = jest.spyOn(axios, "post")
    .mockImplementation(() => Promise.resolve({}) as never);
});

afterEach(() => {
  postSpy.mockRestore();
});

afterAll(() => {
  jest.unmock("../../request_auto_generation");
});
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

  const setStateSync = (instance: StepHeader) => {
    instance.setState = ((state, callback) => {
      const update = typeof state == "function"
        ? state(instance.state, instance.props)
        : state;
      instance.state = { ...instance.state, ...update };
      callback?.();
    }) as StepHeader["setState"];
    return instance;
  };

  it("renders", () => {
    const { container } = render(<StepHeader {...fakeProps()} />);
    const div = container.querySelector(".step-header");
    if (!div) { throw new Error("Expected .step-header"); }
    expect(div.classList.contains("step-header")).toBeTruthy();
    expect(div.classList.contains("step-class")).toBeTruthy();
  });

  it("renders with children", () => {
    const { container } = render(<StepHeader {...fakeProps()} />);
    expect(container.textContent).toContain("child");
  });

  it("renders pinned sequence", () => {
    const p = fakeProps();
    p.executeSequence = fakeSequence().body;
    p.executeSequence.color = "red";
    p.executeSequence.name = "Pinned Sequence";
    const { container } = render(<StepHeader {...p} />);
    const stepHeader = container.querySelector(".step-header");
    if (!stepHeader) { throw new Error("Expected .step-header"); }
    expect(stepHeader.classList.contains("red")).toBeTruthy();
    const openLinkedSequence = container
      .querySelector(".fa-external-link[title=\"open linked sequence\"]");
    expect(openLinkedSequence).toBeTruthy();
  });

  it("toggle draggable", () => {
    const instance = setStateSync(new StepHeader(fakeProps()));
    expect(instance.state.draggable).toEqual(true);
    instance.toggle("enter")();
    expect(instance.state.draggable).toEqual(false);
    instance.toggle("leave")();
    expect(instance.state.draggable).toEqual(true);
  });

  it("toggles prompt", () => {
    const instance = setStateSync(new StepHeader(fakeProps()));
    expect(instance.state.promptOpen).toEqual(false);
    instance.togglePrompt();
    expect(instance.state.promptOpen).toEqual(true);
    instance.togglePrompt();
    expect(instance.state.promptOpen).toEqual(false);
  });

  it("prompt succeeds", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    const instance = setStateSync(new StepHeader(p));
    expect(instance.state.promptText).toEqual("");
    expect(instance.state.isProcessing).toEqual(false);
    const { container } = render(instance.AutoLuaPrompt());
    const textarea = container.querySelector("textarea");
    if (!textarea) { throw new Error("Expected prompt textarea"); }
    fireEvent.change(textarea, { target: { value: "write" } });
    expect(container.textContent).toContain("generate code");
    const button = container.querySelector("button");
    if (!button) { throw new Error("Expected prompt button"); }
    fireEvent.click(button);
    expect(instance.state.isProcessing).toEqual(true);
    expect(requestAutoGeneration).toHaveBeenCalled();
    const { mock } = requestAutoGeneration as jest.Mock;
    mock.calls[0][0].onUpdate("code");
    expect(p.setKey).toHaveBeenCalledWith("code");
    mock.calls[0][0].onSuccess("code");
    jest.runAllTimers();
    expect(p.setKey).toHaveBeenCalledWith("code success");
    mock.calls[0][0].onError();
    expect(instance.state.isProcessing).toEqual(false);
    jest.useRealTimers();
  });

  it("renders while in progress", () => {
    const p = fakeProps();
    const instance = setStateSync(new StepHeader(p));
    instance.setState({ isProcessing: true });
    const { container } = render(instance.AutoLuaPrompt());
    expect(container.textContent).toContain("generating");
  });

  it.each<[string, string]>([
    ["good", "fa-thumbs-up"],
    ["bad", "fa-thumbs-down"],
  ])("shows feedback: %s", (reaction, expected) => {
    const instance = setStateSync(new StepHeader(fakeProps()));
    instance.setState({
      cachedPrompt: "write code", showFeedback: true, reaction,
    });
    const { container } = render(instance.AutoLuaPrompt());
    expect(container.innerHTML).toContain(expected);
  });

  it("submits feedback", () => {
    jest.useFakeTimers();
    const instance = setStateSync(new StepHeader(fakeProps()));
    instance.setState({
      cachedPrompt: "write code", showFeedback: true, reaction: "good",
    });
    instance.submitFeedback("write code", "good")();
    jest.runAllTimers();
    expect(instance.state.cachedPrompt).toEqual("");
    expect(instance.state.showFeedback).toEqual(false);
    expect(instance.state.reaction).toEqual(undefined);
    jest.useRealTimers();
  });
});
