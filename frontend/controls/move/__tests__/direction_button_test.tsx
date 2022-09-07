const mockDevice = { moveRelative: jest.fn((_) => Promise.resolve()) };
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

import React from "react";
import { mount } from "enzyme";
import {
  DirectionButton, directionDisabled, calculateDistance, calcBtnStyle,
} from "../direction_button";
import { ButtonDirection, DirectionButtonProps } from "../interfaces";
import {
  fakeBotLocationData, fakeMovementState,
} from "../../../__test_support__/fake_bot_data";

const fakeProps = (): DirectionButtonProps => ({
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
  arduinoBusy: false,
  botOnline: true,
  setActivePopover: jest.fn(),
  popover: "yup",
  locked: false,
  botPosition: fakeBotLocationData().position,
  movementState: fakeMovementState(),
  dispatch: jest.fn(),
});

describe("<DirectionButton />", () => {
  it("calls move command", () => {
    const p = fakeProps();
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).toHaveBeenCalledTimes(1);
  });

  it("has class for z button", () => {
    const p = fakeProps();
    p.axis = "z";
    const wrapper = mount(<DirectionButton {...p} />);
    expect(wrapper.find("button").hasClass("z")).toBeTruthy();
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).toHaveBeenCalledTimes(1);
  });

  it("shows progress: positive", () => {
    const p = fakeProps();
    p.direction = "up";
    p.botPosition = { x: 1, y: 2, z: 3 };
    p.steps = 100;
    p.arduinoBusy = true;
    p.movementState.start = { x: 0, y: 0, z: 0 };
    p.movementState.distance = { x: 0, y: 1, z: 0 };
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
    expect(wrapper.html()).toContain("movement-progress");
  });

  it("shows progress: negative", () => {
    const p = fakeProps();
    p.direction = "down";
    p.botPosition = { x: 1, y: -1, z: 3 };
    p.steps = 100;
    p.arduinoBusy = true;
    p.movementState.start = { x: 0, y: 0, z: 0 };
    p.movementState.distance = { x: 0, y: -2, z: 0 };
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
    expect(wrapper.html()).toContain("movement-progress");
  });

  it("doesn't show progress", () => {
    const p = fakeProps();
    p.direction = "up";
    p.botPosition = { x: 1, y: 2, z: 3 };
    p.steps = 100;
    p.arduinoBusy = true;
    p.movementState.start = { x: 0, y: 0, z: 0 };
    p.movementState.distance = { x: 1, y: 0, z: 0 };
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
    expect(wrapper.html()).not.toContain("movement-progress");
  });

  it("is locked", () => {
    const p = fakeProps();
    p.locked = true;
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("is busy", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("is offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("is at min", () => {
    const p = fakeProps();
    p.botPosition = { x: 1, y: 2, z: 3 };
    p.direction = "down";
    p.directionAxisProps.isInverted = false;
    p.directionAxisProps.negativeOnly = false;
    p.directionAxisProps.position = 0;
    p.directionAxisProps.stopAtHome = true;
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("is at max", () => {
    const p = fakeProps();
    p.botPosition = { x: 1, y: 2, z: 3 };
    p.direction = "up";
    p.directionAxisProps.isInverted = false;
    p.directionAxisProps.negativeOnly = false;
    p.directionAxisProps.position = 1000;
    p.directionAxisProps.stopAtMax = true;
    p.directionAxisProps.axisLength = 1000;
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative).not.toHaveBeenCalled();
  });

  it("call has correct args", () => {
    const p = fakeProps();
    const wrapper = mount(<DirectionButton {...p} />);
    wrapper.simulate("click");
    expect(mockDevice.moveRelative)
      .toHaveBeenCalledWith({ x: 0, y: 1000, z: 0 });
  });
});

describe("calculateDistance()", () => {
  it("normal", () => {
    const p = fakeProps();
    p.steps = 100;
    p.direction = "up";
    p.directionAxisProps.isInverted = false;
    expect(calculateDistance(p)).toEqual(100);
  });

  it("inverted", () => {
    const p = fakeProps();
    p.steps = 100;
    p.direction = "up";
    p.directionAxisProps.isInverted = true;
    expect(calculateDistance(p)).toEqual(-100);
  });

  it("opposite direction", () => {
    const p = fakeProps();
    p.steps = 100;
    p.direction = "down";
    p.directionAxisProps.isInverted = false;
    expect(calculateDistance(p)).toEqual(-100);
  });

  it("opposite direction and inverted", () => {
    const p = fakeProps();
    p.steps = 100;
    p.direction = "down";
    p.directionAxisProps.isInverted = true;
    expect(calculateDistance(p)).toEqual(100);
  });
});

describe("directionDisabled()", () => {
  it("disabled at max", () => {
    const p = fakeProps();
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
    const p = fakeProps();
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
    const p = fakeProps();
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
    const p = fakeProps();
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
    const p = fakeProps();
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

  it("disabled at max: left", () => {
    const p = fakeProps();
    p.direction = "left";
    p.steps = 100;
    p.directionAxisProps = {
      position: 100,
      isInverted: true,
      stopAtHome: false,
      stopAtMax: true,
      axisLength: 100,
      negativeOnly: false,
    };
    expect(directionDisabled(p)).toBeTruthy();
  });

  it("disabled at min: right", () => {
    const p = fakeProps();
    p.direction = "right";
    p.steps = 100;
    p.directionAxisProps = {
      position: 0,
      isInverted: true,
      stopAtHome: true,
      stopAtMax: false,
      axisLength: 0,
      negativeOnly: false,
    };
    expect(directionDisabled(p)).toBeTruthy();
  });
});

describe("calcBtnStyle()", () => {
  it.each<[ButtonDirection, number, React.CSSProperties]>([
    ["up", 50, { height: "50%", bottom: 0, left: 0 }],
    ["down", 50, { height: "50%", top: 0, left: 0 }],
    ["left", 50, { width: "50%", top: 0, right: 0 }],
    ["right", 50, { width: "50%", top: 0, left: 0 }],
  ])("returns correct style for %s button", (direction, remaining, expected) => {
    expect(calcBtnStyle(direction, remaining)).toEqual(expected);
  });
});
