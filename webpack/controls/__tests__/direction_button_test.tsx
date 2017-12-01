const mockDevice = {
  moveRelative: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));
const mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { mount } from "enzyme";
import { DirectionButton } from "../direction_button";
import { DirectionButtonProps } from "../interfaces";

describe("<DirectionButton/>", function () {
  beforeEach(function () {
    jest.clearAllMocks();
    buttonProps.disabled = false;
  });
  const buttonProps: DirectionButtonProps = {
    axis: "y",
    direction: "up",
    isInverted: false,
    steps: 1000,
    disabled: false
  };

  it("calls move command", () => {
    const btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mockDevice.moveRelative).toHaveBeenCalledTimes(1);
  });

  it("is disabled", () => {
    buttonProps.disabled = true;
    const btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("call has correct args", () => {
    const btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ speed: 100, x: 0, y: -1000, z: 0 });
  });
});
