const mockDevice = { emergencyUnlock: jest.fn(() => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { mount } from "enzyme";
import { EStopButton } from "../e_stop_btn";
import { bot } from "../../../__test_support__/fake_state/bot";
import { EStopButtonProps } from "../../interfaces";

describe("<EStopButton />", () => {
  const fakeProps = (): EStopButtonProps => ({ bot, forceUnlock: false });
  it("renders", () => {
    bot.hardware.informational_settings.sync_status = "synced";
    const wrapper = mount(<EStopButton {...fakeProps()} />);
    expect(wrapper.text()).toEqual("E-STOP");
    expect(wrapper.find("button").hasClass("red")).toBeTruthy();
  });

  it("is grayed out when offline", () => {
    bot.hardware.informational_settings.sync_status = undefined;
    const wrapper = mount(<EStopButton {...fakeProps()} />);
    expect(wrapper.text()).toEqual("E-STOP");
    expect(wrapper.find("button").hasClass("pseudo-disabled")).toBeTruthy();
  });

  it("shows locked state", () => {
    bot.hardware.informational_settings.sync_status = "synced";
    bot.hardware.informational_settings.locked = true;
    const wrapper = mount(<EStopButton {...fakeProps()} />);
    expect(wrapper.text()).toEqual("UNLOCK");
    expect(wrapper.find("button").hasClass("yellow")).toBeTruthy();
  });

  it("confirms unlock", () => {
    bot.hardware.informational_settings.sync_status = "synced";
    bot.hardware.informational_settings.locked = true;
    const p = fakeProps();
    p.forceUnlock = false;
    window.confirm = jest.fn(() => false);
    const wrapper = mount(<EStopButton {...p} />);
    expect(wrapper.text()).toEqual("UNLOCK");
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to unlock the device?");
    expect(mockDevice.emergencyUnlock).not.toHaveBeenCalled();
  });

  it("doesn't confirm unlock", () => {
    bot.hardware.informational_settings.sync_status = "synced";
    bot.hardware.informational_settings.locked = true;
    const p = fakeProps();
    p.forceUnlock = true;
    window.confirm = jest.fn(() => false);
    const wrapper = mount(<EStopButton {...p} />);
    expect(wrapper.text()).toEqual("UNLOCK");
    wrapper.find("button").simulate("click");
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockDevice.emergencyUnlock).toHaveBeenCalled();
  });
});
