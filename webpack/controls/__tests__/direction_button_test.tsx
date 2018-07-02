const mockDevice = {
  moveRelative: jest.fn(() => { return Promise.resolve(); }),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("farmbot-toastr", () => ({ success: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { DirectionButton, directionDisabled, calculateDistance } from "../direction_button";
import { DirectionButtonProps } from "../interfaces";

function fakeButtonProps(): DirectionButtonProps {
  return {
    axis: "y",
    direction: "up",
    directionAxisProps: {
      isInverted: false,
      stopAtHome: false,
      stopAtMax: false,
      axisLength: 0,
      negativeOnly: false,
      position: undefined
    },
    steps: 1000,
    disabled: false
  };
}

describe("<DirectionButton/>", function () {
  const buttonProps = fakeButtonProps();

  beforeEach(function () {
    jest.clearAllMocks();
    buttonProps.disabled = false;
  });

  it("calls move command", () => {
    const btn = mount<DirectionButton>(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mockDevice.moveRelative).toHaveBeenCalledTimes(1);
  });

  it("is disabled", () => {
    buttonProps.disabled = true;
    const btn = mount<DirectionButton>(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("call has correct args", () => {
    const btn = mount<DirectionButton>(<DirectionButton {...buttonProps} />);
    btn.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ speed: 100, x: 0, y: 1000, z: 0 });
  });
});

describe("calculateDistance()", () => {
  it("normal", () => {
    const p = fakeButtonProps();
    p.steps = 100;
    p.direction = "up";
    p.directionAxisProps.isInverted = false;
    expect(calculateDistance(p)).toEqual(100);
  });

  it("inverted", () => {
    const p = fakeButtonProps();
    p.steps = 100;
    p.direction = "up";
    p.directionAxisProps.isInverted = true;
    expect(calculateDistance(p)).toEqual(-100);
  });

  it("opposite direction", () => {
    const p = fakeButtonProps();
    p.steps = 100;
    p.direction = "down";
    p.directionAxisProps.isInverted = false;
    expect(calculateDistance(p)).toEqual(-100);
  });

  it("opposite direction and inverted", () => {
    const p = fakeButtonProps();
    p.steps = 100;
    p.direction = "down";
    p.directionAxisProps.isInverted = true;
    expect(calculateDistance(p)).toEqual(100);
  });
});

describe("directionDisabled()", () => {
  it("disabled at max", () => {
    const p = fakeButtonProps();
    p.direction = "up";
    p.steps = 100;
    p.directionAxisProps = {
      position: 10,
      isInverted: false,
      stopAtHome: true,
      stopAtMax: true,
      axisLength: 10,
      negativeOnly: false
    };
    expect(directionDisabled(p)).toBeTruthy();
  });

  it("not disabled at max", () => {
    const p = fakeButtonProps();
    p.direction = "up";
    p.steps = 100;
    p.directionAxisProps = {
      position: 10,
      isInverted: false,
      stopAtHome: false,
      stopAtMax: false,
      axisLength: 10,
      negativeOnly: false
    };
    expect(directionDisabled(p)).toBeFalsy();
  });

  it("disabled at min: positive", () => {
    const p = fakeButtonProps();
    p.direction = "down";
    p.steps = 100;
    p.directionAxisProps = {
      position: 0,
      isInverted: false,
      stopAtHome: true,
      stopAtMax: true,
      axisLength: 10,
      negativeOnly: false
    };
    expect(directionDisabled(p)).toBeTruthy();
  });

  it("disabled at min: negative", () => {
    const p = fakeButtonProps();
    p.direction = "up";
    p.steps = 100;
    p.directionAxisProps = {
      position: 0,
      isInverted: false,
      stopAtHome: true,
      stopAtMax: true,
      axisLength: 10,
      negativeOnly: true
    };
    expect(directionDisabled(p)).toBeTruthy();
  });

  it("not disabled at min", () => {
    const p = fakeButtonProps();
    p.direction = "down";
    p.steps = 100;
    p.directionAxisProps = {
      position: 0,
      isInverted: false,
      stopAtHome: false,
      stopAtMax: false,
      axisLength: 0,
      negativeOnly: false
    };
    expect(directionDisabled(p)).toBeFalsy();
  });
});
