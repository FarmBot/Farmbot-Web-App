const mockDevice = {
  findHome: jest.fn(() => Promise.resolve({}))
};

jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));
import * as React from "react";
import { mount } from "enzyme";
import { HomingRow } from "../homing_row";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<HomingRow />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });

  it("renders three buttons", () => {
    const wrapper = mount<{}>(<HomingRow
      hardware={bot.hardware.mcu_params}
      botDisconnected={false} />);
    const txt = wrapper.text().toUpperCase();
    ["X", "Y", "Z"].map(function (axis) {
      expect(txt).toContain(`HOME ${axis}`);
    });
  });

  it("calls device", () => {
    const result = mount<{}>(<HomingRow
      hardware={bot.hardware.mcu_params}
      botDisconnected={false} />);
    [0, 1, 2].map(i =>
      result.find("LockableButton").at(i).simulate("click"));
    [{ axis: "x", speed: 100 }, { axis: "y", speed: 100 }].map(x =>
      expect(mockDevice.findHome).toHaveBeenCalledWith(x));
  });
});
