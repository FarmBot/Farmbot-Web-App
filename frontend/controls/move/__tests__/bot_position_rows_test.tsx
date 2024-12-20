const mockDevice = {
  moveAbsolute: jest.fn((_) => Promise.resolve()),
  home: jest.fn((_) => Promise.resolve()),
  findHome: jest.fn((_) => Promise.resolve()),
  setZero: jest.fn((_) => Promise.resolve()),
  calibrate: jest.fn((_) => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../config_storage/actions", () => ({
  toggleWebAppBool: jest.fn()
}));

import React from "react";
import { shallow, mount } from "enzyme";
import { BotPositionRows } from "../bot_position_rows";
import { BotPositionRowsProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../../session_keys";
import { clickButton } from "../../../__test_support__/helpers";
import { Path } from "../../../internal_urls";

describe("<BotPositionRows />", () => {
  const mockConfig: Dictionary<boolean> = {};

  const fakeProps = (): BotPositionRowsProps => ({
    getConfigValue: jest.fn(key => mockConfig[key]),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    locationData: bot.hardware.location_data,
    arduinoBusy: false,
    firmwareSettings: {},
    firmwareHardware: undefined,
    botOnline: true,
    locked: false,
    dispatch: jest.fn(),
  });

  it("inputs axis destination", () => {
    const wrapper = shallow(<BotPositionRows {...fakeProps()} />);
    const axisInput = wrapper.find("AxisInputBoxGroup");
    axisInput.simulate("commit", "123");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith("123");
  });

  it("shows encoder position", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    mockConfig[BooleanSetting.raw_encoders] = true;
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const wrapper = mount(<BotPositionRows {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("encoder");
  });

  it("doesn't show encoder position", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    mockConfig[BooleanSetting.raw_encoders] = true;
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<BotPositionRows {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("encoder");
  });

  it("goes home", () => {
    const wrapper = mount(<BotPositionRows {...fakeProps()} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 0, "move to home");
    expect(mockDevice.home).toHaveBeenCalledWith({ axis: "x", speed: 100 });
  });

  it("finds home", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const wrapper = mount(<BotPositionRows {...p} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 1, "find home");
    expect(mockDevice.findHome).toHaveBeenCalledWith({ axis: "x", speed: 100 });
  });

  it("sets zero", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const wrapper = mount(<BotPositionRows {...p} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 2, "set home");
    expect(mockDevice.setZero).toHaveBeenCalledWith("x");
  });

  it("calibrates", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const wrapper = mount(<BotPositionRows {...p} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 3, "find length");
    expect(mockDevice.calibrate).toHaveBeenCalledWith({ axis: "x" });
  });

  it("navigates to axis settings", () => {
    const wrapper = mount(<BotPositionRows {...fakeProps()} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    wrapper.find("a").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("axes"));
  });
});
