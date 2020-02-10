const mockDevice = {
  moveAbsolute: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../config_storage/actions", () => ({
  toggleWebAppBool: jest.fn()
}));

import * as React from "react";
import { shallow, mount } from "enzyme";
import { BotPositionRows, BotPositionRowsProps } from "../bot_position_rows";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../../session_keys";

describe("<BotPositionRows />", () => {
  const mockConfig: Dictionary<boolean> = {};

  const fakeProps = (): BotPositionRowsProps => ({
    getValue: jest.fn(key => mockConfig[key]),
    locationData: bot.hardware.location_data,
    arduinoBusy: false,
    firmwareHardware: undefined,
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
});
