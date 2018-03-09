const mockDevice = {
  home: jest.fn(() => { return Promise.resolve(); }),
  takePhoto: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));
const mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { mount } from "enzyme";
import { JogButtons } from "../jog_buttons";
import { JogMovementControlsProps } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<JogButtons/>", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    jogButtonProps.disabled = false;
  });
  const jogButtonProps: JogMovementControlsProps = {
    bot: bot,
    x_axis_inverted: false,
    y_axis_inverted: false,
    z_axis_inverted: false,
    disabled: false,
    firmwareSettings: bot.hardware.mcu_params
  };

  it("calls home command", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.home).toHaveBeenCalledTimes(1);
  });

  it("is disabled", () => {
    jogButtonProps.disabled = true;
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.home).not.toHaveBeenCalled();
  });

  it("call has correct args", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mockDevice.home)
      .toHaveBeenCalledWith({ axis: "all", speed: 100 });
  });

  it("takes photo", () => {
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(0).simulate("click");
    expect(mockDevice.takePhoto).toHaveBeenCalled();
  });
});
