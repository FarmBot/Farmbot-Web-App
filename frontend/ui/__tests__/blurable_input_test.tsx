import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BlurableInput, BIProps } from "../blurable_input";
import { error } from "../../toast/toast";
import {
  focusEvent,
  keyboardEvent,
} from "../../__test_support__/fake_html_events";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

describe("<BlurableInput />", () => {
  const wrappers: ReturnType<typeof createRenderer>[] = [];

  const fakeProps = (): BIProps => ({
    onCommit: jest.fn(),
    value: "",
  });

  const createWrapper = (p = fakeProps()) => {
    const wrapper = createRenderer(<BlurableInput {...p} />);
    wrappers.push(wrapper);
    return wrapper;
  };

  const getInstance = (wrapper: ReturnType<typeof createRenderer>) =>
    getRendererInstance<BlurableInput, BIProps>(wrapper, BlurableInput);

  beforeEach(() => jest.clearAllMocks());

  afterEach(() => {
    while (wrappers.length > 0) {
      const wrapper = wrappers.pop();
      wrapper && unmountRenderer(wrapper);
    }
  });

  it.each<[BIProps["type"], string | number, string]>([
    ["text", "original", "changed"],
    ["number", 0, "1"],
    ["date", "2017-05-29", "2017-05-30"],
    ["time", "09:00", "10:00"],
    ["email", "old@example.com", "new@example.com"],
  ])("highlights pending edits until restore or blur: %s", (type, value, next) => {
    const p = { ...fakeProps(), type, value, className: "custom modified" };
    render(<BlurableInput {...p} />);
    const input = screen.getByDisplayValue(String(value));
    fireEvent.focus(input);
    expect(input).toHaveValue(value);
    expect(input).not.toHaveClass("pending");
    fireEvent.change(input, { target: { value: next } });
    expect(input).toHaveClass("custom", "modified", "pending");
    expect(p.onCommit).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: String(value) } });
    expect(input).not.toHaveClass("pending");
    fireEvent.change(input, { target: { value: next } });
    fireEvent.blur(input);
    expect(p.onCommit).toHaveBeenCalledTimes(1);
    expect(input).not.toHaveClass("pending");
    expect(input).toHaveClass("custom", "modified");
  });

  it("prioritizes errors over pending edit highlighting", () => {
    const p = { ...fakeProps(), type: "number" as const, value: 1, min: 0 };
    render(<BlurableInput {...p} />);
    const input = screen.getByDisplayValue("1");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "-1" } });
    expect(input).toHaveClass("error");
    expect(input).not.toHaveClass("pending");
  });

  it("focuses", () => {
    const p = fakeProps();
    p.value = "1";
    const wrapper = createWrapper(p);
    actRenderer(() => {
      wrapper.root.findByType("input").props.onFocus();
    });
    expect(getInstance(wrapper).state.buffer).toEqual("1");
    expect(getInstance(wrapper).state.isEditing).toEqual(true);
  });

  it("out of bounds: under", () => {
    const p = fakeProps();
    p.type = "number";
    p.min = 0;
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper).setState({ buffer: "-100" });
    });
    actRenderer(() => {
      wrapper.root.findByType("input").props.onSubmit({});
    });
    expect(getInstance(wrapper).state.buffer).toEqual("");
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Value must be greater than or equal to 0.");
  });

  it("out of bounds: over", () => {
    const p = fakeProps();
    p.type = "number";
    p.max = 100;
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper).setState({ buffer: "101" });
    });
    actRenderer(() => {
      wrapper.root.findByType("input").props.onSubmit({});
    });
    expect(getInstance(wrapper).state.buffer).toEqual("");
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Value must be less than or equal to 100.");
  });

  it("checks for non-number input", () => {
    const p = fakeProps();
    p.type = "number";
    const wrapper = createWrapper(p);
    actRenderer(() => {
      wrapper.root.findByType("input").props.onChange({
        currentTarget: { value: "" },
      });
    });
    expect(getInstance(wrapper).state.buffer).toEqual("");
    expect(getInstance(wrapper).state.error)
      .toEqual("Please enter a number.");
    actRenderer(() => {
      wrapper.root.findByType("input").props.onSubmit({});
    });
    expect(p.onCommit).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("allows empty input", () => {
    const p = fakeProps();
    p.type = "number";
    p.allowEmpty = true;
    const wrapper = createWrapper(p);
    actRenderer(() => {
      wrapper.root.findByType("input").props.onChange({
        currentTarget: { value: "" },
      });
    });
    expect(getInstance(wrapper).state.buffer).toEqual("");
    expect(getInstance(wrapper).state.error).toEqual(undefined);
    actRenderer(() => {
      wrapper.root.findByType("input").props.onSubmit({});
    });
    expect(p.onCommit).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("parses number", () => {
    const p = fakeProps();
    p.type = "number";
    const wrapper = createWrapper(p);
    const e = { currentTarget: { value: "-1.1e+2" } };
    actRenderer(() => {
      getInstance(wrapper).setState({
        buffer: e.currentTarget.value,
      });
    });
    actRenderer(() => {
      wrapper.root.findByType("input").props.onChange(e);
    });
    expect(getInstance(wrapper).state.buffer)
      .toEqual(e.currentTarget.value);
  });

  it("triggers keyUp", () => {
    const p = fakeProps();
    p.clearBtn = true;
    p.keyCallback = undefined;
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper).setState({ buffer: "1" });
    });
    actRenderer(() => {
      getInstance(wrapper).keyUp(keyboardEvent(""));
    });
    expect(getInstance(wrapper).state.buffer).toEqual("1");
  });

  it("clears input", () => {
    const p = fakeProps();
    p.clearBtn = true;
    p.keyCallback = undefined;
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper).setState({ buffer: "1" });
    });
    actRenderer(() => {
      wrapper.root.findByProps({ className: "fa fa-undo" }).props.onClick();
    });
    expect(getInstance(wrapper).state.buffer).toEqual("");
  });

  it("clears input with callback", () => {
    const p = fakeProps();
    p.clearBtn = true;
    p.keyCallback = jest.fn();
    const wrapper = createWrapper(p);
    actRenderer(() => {
      getInstance(wrapper).setState({ buffer: "1" });
    });
    actRenderer(() => {
      wrapper.root.findByProps({ className: "fa fa-undo" }).props.onClick();
    });
    expect(getInstance(wrapper).state.buffer).toEqual("");
    expect(p.keyCallback).toHaveBeenCalled();
  });

  it("auto-selects", () => {
    const p = fakeProps();
    p.autoSelect = true;
    const wrapper = createWrapper(p);
    const e = focusEvent("text");
    actRenderer(() => {
      getInstance(wrapper).focus(e);
    });
    expect(e.target.setSelectionRange).toHaveBeenCalledWith(0, 4);
  });
});
