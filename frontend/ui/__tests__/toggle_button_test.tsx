import React from "react";
import TestRenderer from "react-test-renderer";
import { fireEvent, render } from "@testing-library/react";
import { ToggleButton, ToggleButtonProps } from "../toggle_button";

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
    const wrapper = TestRenderer.create(<ToggleButton {...p} />);
    const instance = wrapper.getInstance() as ToggleButton;
    instance.componentDidUpdate();
    expect(instance.state.syncing).toEqual(true);
    jest.runAllTimers();
    expect(instance.state.syncing).toEqual(false);
    instance.setState({ inconsistent: false });
    instance.componentDidUpdate();
    wrapper.unmount();
  });
});
