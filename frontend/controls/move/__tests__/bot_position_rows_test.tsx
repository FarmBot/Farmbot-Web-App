const mockDevice = {
  moveAbsolute: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("../../../config_storage/actions", () => {
  return {
    toggleWebAppBool: jest.fn()
  };
});

import * as React from "react";
import { shallow, mount } from "enzyme";
import { BotPositionRows, BotPositionRowsProps } from "../bot_position_rows";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../../session_keys";

describe("<BotPositionRows />", () => {
  const mockConfig: Dictionary<boolean> = {};

  function fakeProps(): BotPositionRowsProps {
    return {
      getValue: jest.fn(key => mockConfig[key]),
      locationData: bot.hardware.location_data,
      arduinoBusy: false,
      firmware_version: undefined,
    };
  }

  it("inputs axis destination", () => {
    const wrapper = shallow(<BotPositionRows {...fakeProps()} />);
    const axisInput = wrapper.find("AxisInputBoxGroup");
    axisInput.simulate("commit", "123");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith("123");
  });

  it("shows encoder position in steps", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    const p = fakeProps();
    p.firmware_version = undefined;
    const wrapper = mount(<BotPositionRows {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("scaled encoder (steps)");
  });

  it("shows encoder position in mm", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    const p = fakeProps();
    p.firmware_version = "6.0.0";
    const wrapper = mount(<BotPositionRows {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("scaled encoder (mm)");
  });
});
