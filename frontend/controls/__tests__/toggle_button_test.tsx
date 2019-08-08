import * as React from "react";
import { mount } from "enzyme";
import { ToggleButton } from "../toggle_button";
import { ToggleButtonProps } from "../interfaces";

describe("<ToggleButton/>", function () {
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
});
