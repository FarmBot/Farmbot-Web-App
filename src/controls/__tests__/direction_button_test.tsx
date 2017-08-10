jest.mock("../../device", () => ({
  devices: {
    current: {
      moveRelative: jest.fn(() => { return Promise.resolve(); }),
    }
  }
}));
let mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { mount } from "enzyme";
import { DirectionButton } from "../direction_button";
import { DirectionButtonProps } from "../interfaces";
import { devices } from "../../device";

describe("<DirectionButton/>", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    buttonProps.disabled = false;
  });
  let buttonProps: DirectionButtonProps = {
    axis: "y",
    direction: "up",
    isInverted: false,
    steps: 1000,
    disabled: false
  };

  it("calls move command", () => {
    let { mock } = devices.current.moveRelative as jest.Mock<{}>;
    let btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mock.calls.length).toEqual(1);
  });

  it("is disabled", () => {
    let { mock } = devices.current.moveRelative as jest.Mock<{}>;
    buttonProps.disabled = true;
    let btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mock.calls.length).toEqual(0);
  });

  it("call has correct args", () => {
    let { mock } = devices.current.moveRelative as jest.Mock<{}>;
    let btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    let argList = mock.calls[0][0];
    expect(argList.x).toEqual(0);
    expect(argList.y).toEqual(-1000);
    expect(argList.z).toEqual(0);
  });
});
