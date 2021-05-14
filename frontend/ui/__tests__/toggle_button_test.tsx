import React from "react";
import { mount } from "enzyme";
import { ToggleButton, ToggleButtonProps } from "../toggle_button";

describe("<ToggleButton />", () => {
  const fakeProps = (): ToggleButtonProps => ({
    toggleValue: 0,
    toggleAction: jest.fn(),
  });

  it("calls toggle action", () => {
    const p = fakeProps();
    const toggleButton = mount(<ToggleButton {...p} />);
    toggleButton.simulate("click");
    expect(p.toggleAction).toHaveBeenCalledTimes(1);
  });

  it("displays no", () => {
    const toggleButton = mount(<ToggleButton {...fakeProps()} />);
    expect(toggleButton.text()).toBe("no");
  });

  it("displays yes", () => {
    const p = fakeProps();
    p.toggleValue = 1;
    const toggleButton = mount(<ToggleButton {...p} />);
    expect(toggleButton.text()).toBe("yes");
  });

  it("displays off", () => {
    const p = fakeProps();
    p.customText = { textFalse: "off", textTrue: "on" };
    const toggleButton = mount(<ToggleButton {...p} />);
    expect(toggleButton.text()).toEqual("off");
  });

  it("displays on", () => {
    const p = fakeProps();
    p.toggleValue = 1;
    p.customText = { textFalse: "off", textTrue: "on" };
    const toggleButton = mount(<ToggleButton {...p} />);
    expect(toggleButton.text()).toEqual("on");
  });

  it("displays 🚫", () => {
    const p = fakeProps();
    p.toggleValue = undefined;
    p.customText = { textFalse: "off", textTrue: "on" };
    const toggleButton = mount(<ToggleButton {...p} />);
    expect(toggleButton.text()).toEqual("🚫");
  });

  it("displays dim", () => {
    const p = fakeProps();
    p.dim = true;
    const toggleButton = mount(<ToggleButton {...p} />);
    expect(toggleButton.html()).toContain("dim");
  });

  it("updates status", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.dim = true;
    const wrapper = mount<ToggleButton>(<ToggleButton {...p} />);
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().syncing).toEqual(true);
    jest.runAllTimers();
    expect(wrapper.state().syncing).toEqual(false);
    wrapper.setState({ inconsistent: false });
    wrapper.instance().componentDidUpdate();
  });
});
