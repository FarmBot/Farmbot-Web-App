import React from "react";
import TestRenderer from "react-test-renderer";
import { BlurableInput, BIProps } from "../blurable_input";
import { error } from "../../toast/toast";
import {
  focusEvent,
  keyboardEvent,
} from "../../__test_support__/fake_html_events";

describe("<BlurableInput />", () => {
  const wrappers: TestRenderer.ReactTestRenderer[] = [];

  const fakeProps = (): BIProps => ({
    onCommit: jest.fn(),
    value: "",
  });

  const createWrapper = (p = fakeProps()) => {
    const wrapper = TestRenderer.create(<BlurableInput {...p} />);
    wrappers.push(wrapper);
    return wrapper;
  };

  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    while (wrappers.length > 0) {
      const wrapper = wrappers.pop();
      wrapper && TestRenderer.act(() => wrapper.unmount());
    }
  });

  it("focuses", () => {
    const p = fakeProps();
    p.value = "1";
    const wrapper = createWrapper(p);
    wrapper.root.findByType("input").props.onFocus();
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("1");
    expect((wrapper.getInstance() as BlurableInput).state.isEditing).toEqual(true);
  });

  it("out of bounds: under", () => {
    const p = fakeProps();
    p.type = "number";
    p.min = 0;
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as BlurableInput).setState({ buffer: "-100" });
    wrapper.root.findByType("input").props.onSubmit({});
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("");
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Value must be greater than or equal to 0.");
  });

  it("out of bounds: over", () => {
    const p = fakeProps();
    p.type = "number";
    p.max = 100;
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as BlurableInput).setState({ buffer: "101" });
    wrapper.root.findByType("input").props.onSubmit({});
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("");
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Value must be less than or equal to 100.");
  });

  it("checks for non-number input", () => {
    const p = fakeProps();
    p.type = "number";
    const wrapper = createWrapper(p);
    wrapper.root.findByType("input").props.onChange({
      currentTarget: { value: "" },
    });
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("");
    expect((wrapper.getInstance() as BlurableInput).state.error)
      .toEqual("Please enter a number.");
    wrapper.root.findByType("input").props.onSubmit({});
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("allows empty input", () => {
    const p = fakeProps();
    p.type = "number";
    p.allowEmpty = true;
    const wrapper = createWrapper(p);
    wrapper.root.findByType("input").props.onChange({
      currentTarget: { value: "" },
    });
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("");
    expect((wrapper.getInstance() as BlurableInput).state.error).toEqual(undefined);
    wrapper.root.findByType("input").props.onSubmit({});
    expect(p.onCommit).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("parses number", () => {
    const p = fakeProps();
    p.type = "number";
    const wrapper = createWrapper(p);
    const e = { currentTarget: { value: "-1.1e+2" } };
    (wrapper.getInstance() as BlurableInput).setState({
      buffer: e.currentTarget.value,
    });
    wrapper.root.findByType("input").props.onChange(e);
    expect((wrapper.getInstance() as BlurableInput).state.buffer)
      .toEqual(e.currentTarget.value);
  });

  it("triggers keyUp", () => {
    const p = fakeProps();
    p.clearBtn = true;
    p.keyCallback = undefined;
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as BlurableInput).setState({ buffer: "1" });
    (wrapper.getInstance() as BlurableInput).keyUp(keyboardEvent(""));
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("1");
  });

  it("clears input", () => {
    const p = fakeProps();
    p.clearBtn = true;
    p.keyCallback = undefined;
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as BlurableInput).setState({ buffer: "1" });
    wrapper.root.findByProps({ className: "fa fa-undo" }).props.onClick();
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("");
  });

  it("clears input with callback", () => {
    const p = fakeProps();
    p.clearBtn = true;
    p.keyCallback = jest.fn();
    const wrapper = createWrapper(p);
    (wrapper.getInstance() as BlurableInput).setState({ buffer: "1" });
    wrapper.root.findByProps({ className: "fa fa-undo" }).props.onClick();
    expect((wrapper.getInstance() as BlurableInput).state.buffer).toEqual("");
    expect(p.keyCallback).toHaveBeenCalled();
  });

  it("auto-selects", () => {
    const p = fakeProps();
    p.autoSelect = true;
    const wrapper = createWrapper(p);
    const e = focusEvent("text");
    (wrapper.getInstance() as BlurableInput).focus(e);
    expect(e.target.setSelectionRange).toHaveBeenCalledWith(0, 4);
  });
});
