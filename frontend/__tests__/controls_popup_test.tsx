const mockDevice = {
  moveRelative: jest.fn(() => Promise.resolve()),
  takePhoto: jest.fn(() => Promise.resolve()),
};
jest.mock("../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import { ControlsPopupProps } from "../controls/move/interfaces";
import { error } from "../toast/toast";
import { Content, ToolTips } from "../constants";

describe("<ControlsPopup />", () => {
  const fakeProps = (): ControlsPopupProps => ({
    dispatch: jest.fn(),
    axisInversion: { x: true, y: false, z: false },
    botPosition: { x: undefined, y: undefined, z: undefined },
    firmwareSettings: bot.hardware.mcu_params,
    xySwap: false,
    arduinoBusy: false,
    stepSize: 100,
    botOnline: true,
    env: {},
  });

  it("Has a false initial state", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    expect(wrapper.state("isOpen")).toBeFalsy();
  });

  it("Toggles state", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    const parent = wrapper.find("i").first();
    parent.simulate("click");
    expect(wrapper.state("isOpen")).toBeTruthy();
  });

  it("x axis is inverted", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.setState({ isOpen: true });
    const button = wrapper.find("button").at(3);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("y axis is not inverted", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.setState({ isOpen: true });
    const button = wrapper.find("button").at(1);
    expect(button.props().title).toBe("move y axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 100, z: 0 });
  });

  it("disabled when closed", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.setState({ isOpen: false });
    [0, 1, 2, 3].map((i) => wrapper.find("button").at(i).simulate("click"));
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("swaps axes", () => {
    const swappedProps = fakeProps();
    swappedProps.xySwap = true;
    swappedProps.axisInversion.x = false;
    const swapped = mount(<ControlsPopup {...swappedProps} />);
    swapped.setState({ isOpen: true });
    expect(swapped.state("isOpen")).toBeTruthy();
    const button = swapped.find("button").at(1);
    expect(button.props().title).toBe("move x axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
  });

  it("takes photo", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.setState({ isOpen: true });
    const btn = wrapper.find("button").at(4);
    expect(btn.props().title).not.toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("shows camera as disabled", () => {
    const p = fakeProps();
    p.env = { camera: "NONE" };
    const wrapper = mount(<ControlsPopup {...p} />);
    wrapper.setState({ isOpen: true });
    const btn = wrapper.find("button").at(4);
    expect(btn.props().title).toEqual(Content.NO_CAMERA_SELECTED);
    btn.simulate("click");
    expect(error).toHaveBeenCalledWith(
      ToolTips.SELECT_A_CAMERA, Content.NO_CAMERA_SELECTED);
    expect(mockDevice.takePhoto).not.toHaveBeenCalled();
  });
});
