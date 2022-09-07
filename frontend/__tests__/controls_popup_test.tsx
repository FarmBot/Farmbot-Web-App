const mockDevice = {
  moveRelative: jest.fn((_) => Promise.resolve()),
  takePhoto: jest.fn(() => Promise.resolve()),
};
jest.mock("../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { ControlsPopup } from "../controls_popup";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import { ControlsPopupProps } from "../controls/move/interfaces";
import { Actions } from "../constants";
import { fakeMovementState } from "../__test_support__/fake_bot_data";

describe("<ControlsPopup />", () => {
  const fakeProps = (): ControlsPopupProps => ({
    dispatch: jest.fn(),
    botPosition: { x: undefined, y: undefined, z: undefined },
    firmwareSettings: bot.hardware.mcu_params,
    getConfigValue: () => false,
    arduinoBusy: false,
    stepSize: 100,
    botOnline: true,
    env: {},
    locked: false,
    isOpen: true,
    movementState: fakeMovementState(),
    imageJobs: [],
    logs: [],
  });

  it("toggles open state", () => {
    const p = fakeProps();
    const wrapper = mount(<ControlsPopup {...p} />);
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeTruthy();
    wrapper.find("img").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_CONTROLS_POPUP, payload: false,
    });
  });

  it("sends movement command", () => {
    const wrapper = mount(<ControlsPopup {...fakeProps()} />);
    wrapper.find("img").first().simulate("click");
    const button = wrapper.find("button").at(2);
    expect(button.props().title).toBe("move y axis (100)");
    button.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 100, z: 0 });
  });

  it("disabled when closed", () => {
    const p = fakeProps();
    p.isOpen = false;
    const wrapper = mount(<ControlsPopup {...p} />);
    expect(wrapper.find(".controls-popup").hasClass("open")).toBeFalsy();
    [0, 1, 2, 3].map((i) => wrapper.find("button").at(i).simulate("click"));
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });
});
