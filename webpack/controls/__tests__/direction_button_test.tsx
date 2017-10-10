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
import { getDevice } from "../../device";

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
    const { mock } = getDevice().moveRelative as jest.Mock<{}>;
    const btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mock.calls.length).toEqual(1);
  });

  it("is disabled", () => {
    const { mock } = getDevice().moveRelative as jest.Mock<{}>;
    buttonProps.disabled = true;
    const btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mock.calls.length).toEqual(0);
  });

  it("call has correct args", () => {
    const { mock } = getDevice().moveRelative as jest.Mock<{}>;
    const btn = mount(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    const argList = mock.calls[0][0];
    expect(argList.x).toEqual(0);
    expect(argList.y).toEqual(-1000);
    expect(argList.z).toEqual(0);
  });
});
