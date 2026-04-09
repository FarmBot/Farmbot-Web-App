import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { ToggleButton, ToggleButtonProps } from "../toggle_button";
import {
  actRenderer,
  createRenderer,
  getRendererInstance,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

describe("<ToggleButton />", () => {
  const fakeProps = (): ToggleButtonProps => ({
    toggleValue: 0,
    toggleAction: jest.fn(),
  });

  it("calls toggle action", () => {
    const p = fakeProps();
    const { container } = render(<ToggleButton {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.toggleAction).toHaveBeenCalledTimes(1);
  });

  it("displays no", () => {
    const { container } = render(<ToggleButton {...fakeProps()} />);
    expect(container.querySelector("button")?.textContent).toBe("no");
  });

  it("displays yes", () => {
    const p = fakeProps();
    p.toggleValue = 1;
    const { container } = render(<ToggleButton {...p} />);
    expect(container.querySelector("button")?.textContent).toBe("yes");
  });

  it("displays off", () => {
    const p = fakeProps();
    p.customText = { textFalse: "off", textTrue: "on" };
    const { container } = render(<ToggleButton {...p} />);
    expect(container.querySelector("button")?.textContent).toEqual("off");
  });

  it("displays on", () => {
    const p = fakeProps();
    p.toggleValue = 1;
    p.customText = { textFalse: "off", textTrue: "on" };
    const { container } = render(<ToggleButton {...p} />);
    expect(container.querySelector("button")?.textContent).toEqual("on");
  });

  it("displays 🚫", () => {
    const p = fakeProps();
    p.toggleValue = undefined;
    p.customText = { textFalse: "off", textTrue: "on" };
    const { container } = render(<ToggleButton {...p} />);
    expect(container.querySelector("button")?.textContent).toEqual("🚫");
  });

  it("displays dim", () => {
    const p = fakeProps();
    p.dim = true;
    const { container } = render(<ToggleButton {...p} />);
    expect(container.querySelector("button")?.className).toContain("dim");
  });

  it("updates status", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.dim = true;
    const wrapper = createRenderer(<ToggleButton {...p} />);
    const instance = getRendererInstance<ToggleButton, ToggleButtonProps>(
      wrapper, ToggleButton);
    actRenderer(() => {
      instance.componentDidUpdate();
    });
    expect(instance.state.syncing).toEqual(true);
    actRenderer(() => {
      jest.runAllTimers();
    });
    expect(instance.state.syncing).toEqual(false);
    actRenderer(() => {
      instance.setState({ inconsistent: false });
    });
    actRenderer(() => {
      instance.componentDidUpdate();
    });
    unmountRenderer(wrapper);
    jest.useRealTimers();
  });
});
