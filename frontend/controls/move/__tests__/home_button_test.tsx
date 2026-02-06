import React from "react";
import { mount } from "enzyme";
import { calculateHomeDirection, HomeButton } from "../home_button";
import * as deviceActions from "../../../devices/actions";
import { HomeButtonProps } from "../interfaces";
import {
  fakeBotLocationData, fakeMovementState,
} from "../../../__test_support__/fake_bot_data";
import { bot } from "../../../__test_support__/fake_state/bot";

let moveToHomeSpy: jest.SpyInstance;
let findHomeSpy: jest.SpyInstance;

describe("<HomeButton />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    moveToHomeSpy =
      jest.spyOn(deviceActions, "moveToHome").mockImplementation(jest.fn());
    findHomeSpy =
      jest.spyOn(deviceActions, "findHome").mockImplementation(jest.fn());
  });

  afterEach(() => {
    moveToHomeSpy.mockRestore();
    findHomeSpy.mockRestore();
  });

  const fakeProps = (): HomeButtonProps => ({
    doFindHome: false,
    arduinoBusy: false,
    botOnline: true,
    locked: false,
    popover: undefined,
    setActivePopover: jest.fn(),
    movementState: fakeMovementState(),
    botPosition: fakeBotLocationData().position,
    dispatch: jest.fn(),
    firmwareSettings: bot.hardware.mcu_params,
  });

  it("call has correct args", () => {
    const p = fakeProps();
    p.popover = "fa-arrow-right";
    p.botPosition = { x: 100, y: 100, z: 100 };
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.moveToHome).toHaveBeenCalledWith("all");
  });

  it("calls home command", () => {
    const p = fakeProps();
    p.botPosition = { x: 100, y: 100, z: 100 };
    p.firmwareSettings.encoder_enabled_x = 0;
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.moveToHome).toHaveBeenCalledTimes(1);
  });

  it("calls find home command", () => {
    const p = fakeProps();
    p.doFindHome = true;
    p.firmwareSettings.encoder_enabled_x = 1;
    p.firmwareSettings.encoder_enabled_y = 1;
    p.firmwareSettings.encoder_enabled_z = 1;
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.findHome).toHaveBeenCalledTimes(1);
  });

  it("is locked", () => {
    const p = fakeProps();
    p.locked = true;
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.moveToHome).not.toHaveBeenCalled();
  });

  it("is busy", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.moveToHome).not.toHaveBeenCalled();
  });

  it("is offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.moveToHome).not.toHaveBeenCalled();
  });

  it("is already at home", () => {
    const p = fakeProps();
    p.botPosition = { x: 0, y: 0, z: 0 };
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.moveToHome).not.toHaveBeenCalled();
  });

  it("is detection disabled", () => {
    const p = fakeProps();
    p.doFindHome = true;
    p.firmwareSettings.encoder_enabled_x = 0;
    const wrapper = mount(<HomeButton {...p} />);
    wrapper.find("button").simulate("click");
    expect(deviceActions.findHome).not.toHaveBeenCalled();
  });
});

describe("calculateHomeDirection()", () => {
  it("returns correct direction", () => {
    expect(calculateHomeDirection(true, true)).toEqual(45);
    expect(calculateHomeDirection(true, false)).toEqual(-45);
    expect(calculateHomeDirection(false, true)).toEqual(135);
    expect(calculateHomeDirection(false, false)).toEqual(-135);
  });
});
