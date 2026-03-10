import React from "react";
import { render } from "@testing-library/react";
import { MoveStepInputProps } from "../interfaces";
import { MoveStepInput } from "../input";

describe("<MoveStepInput />", () => {
  const fakeProps = (): MoveStepInputProps => ({
    field: "offset",
    axis: "x",
    value: undefined,
    onCommit: jest.fn(),
    setValue: jest.fn(),
  });

  it("renders number input", () => {
    const p = fakeProps();
    p.value = 1;
    const wrapper = MoveStepInput(p);
    expect(wrapper.props.type).toEqual("number");
  });

  it("renders text input", () => {
    const p = fakeProps();
    p.value = "value";
    const wrapper = MoveStepInput(p);
    expect(wrapper.props.type).toEqual("text");
  });

  it("clears value", () => {
    const p = fakeProps();
    p.value = "lua";
    const wrapper = MoveStepInput(p);
    wrapper.props.keyCallback?.("", "");
    expect(p.setValue).toHaveBeenCalled();
  });

  it("sets lua value", () => {
    const p = fakeProps();
    p.value = undefined;
    const wrapper = MoveStepInput(p);
    wrapper.props.keyCallback?.("=", "");
    expect(p.setValue).toHaveBeenCalledWith("");
  });

  it("shows default lua value", () => {
    const p = fakeProps();
    p.value = "";
    const { container } = render(<MoveStepInput {...p} />);
    const input = container.querySelector("input");
    if (!input) { throw new Error("Expected input"); }
    expect((input).value).toEqual("");
  });

  it("calls back", () => {
    const p = fakeProps();
    p.onClear = jest.fn();
    const wrapper = MoveStepInput(p);
    wrapper.props.keyCallback?.("", "");
    expect(p.onClear).toHaveBeenCalled();
  });
});
