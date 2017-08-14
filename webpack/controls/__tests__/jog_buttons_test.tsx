jest.mock("../../device", () => ({
  devices: {
    current: {
      home: jest.fn(() => { return Promise.resolve(); }),
    }
  }
}));
let mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { mount } from "enzyme";
import { JogButtons } from "../jog_buttons";
import { JogMovementControlsProps } from "../interfaces";
import { devices } from "../../device";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<JogButtons/>", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    jogButtonProps.disabled = false;
  });
  let jogButtonProps: JogMovementControlsProps = {
    bot: bot,
    x_axis_inverted: false,
    y_axis_inverted: false,
    z_axis_inverted: false,
    disabled: false
  };

  it("calls home command", () => {
    let { mock } = devices.current.home as jest.Mock<{}>;
    let jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(2).simulate("click");
    expect(mock.calls.length).toEqual(1);
  });

  it("is disabled", () => {
    let { mock } = devices.current.home as jest.Mock<{}>;
    jogButtonProps.disabled = true;
    let jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(2).simulate("click");
    expect(mock.calls.length).toEqual(0);
  });

  it("call has correct args", () => {
    let { mock } = devices.current.home as jest.Mock<{}>;
    let jogButtons = mount(<JogButtons {...jogButtonProps} />);
    jogButtons.find("button").at(2).simulate("click");
    let argList = mock.calls[0][0];
    expect(argList.axis).toEqual("all");
    expect(argList.speed).toEqual(100);
  });
});
