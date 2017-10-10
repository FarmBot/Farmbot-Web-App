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
import { getDevice } from "../../device";
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
    disabled: false
  };

  it("calls home command", () => {
    const { mock } = getDevice().home as jest.Mock<{}>;
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mock.calls.length).toEqual(1);
  });

  it("is disabled", () => {
    const { mock } = getDevice().home as jest.Mock<{}>;
    jogButtonProps.disabled = true;
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(3).simulate("click");
    expect(mock.calls.length).toEqual(0);
  });

  it("call has correct args", () => {
    const { mock } = getDevice().home as jest.Mock<{}>;
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(3).simulate("click");
    const argList = mock.calls[0][0];
    expect(argList.axis).toEqual("all");
    expect(argList.speed).toEqual(100);
  });

  it("takes photo", () => {
    const takePhoto = getDevice().takePhoto as jest.Mock<{}>;
    const jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(0).simulate("click");
    expect(takePhoto).toHaveBeenCalled();
  });
});
