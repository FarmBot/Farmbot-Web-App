import React from "react";
import { shallow, mount } from "enzyme";
import { BotPositionRows } from "../bot_position_rows";
import { BotPositionRowsProps } from "../interfaces";
import * as deviceActions from "../../../devices/actions";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../../session_keys";
import { clickButton } from "../../../__test_support__/helpers";
import { Path } from "../../../internal_urls";
import * as configStorageActions from "../../../config_storage/actions";
import { cloneDeep } from "lodash";

describe("<BotPositionRows />", () => {
  const mockConfig: Dictionary<boolean> = {};
  let moveAbsoluteSpy: jest.SpyInstance;
  let moveToHomeSpy: jest.SpyInstance;
  let findHomeSpy: jest.SpyInstance;
  let setHomeSpy: jest.SpyInstance;
  let findAxisLengthSpy: jest.SpyInstance;
  let toggleWebAppBoolSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.keys(mockConfig).forEach(key => delete mockConfig[key]);
    moveAbsoluteSpy =
      jest.spyOn(deviceActions, "moveAbsolute").mockImplementation(jest.fn());
    moveToHomeSpy =
      jest.spyOn(deviceActions, "moveToHome").mockImplementation(jest.fn());
    findHomeSpy =
      jest.spyOn(deviceActions, "findHome").mockImplementation(jest.fn());
    setHomeSpy =
      jest.spyOn(deviceActions, "setHome").mockImplementation(jest.fn());
    findAxisLengthSpy =
      jest.spyOn(deviceActions, "findAxisLength").mockImplementation(jest.fn());
    toggleWebAppBoolSpy =
      jest.spyOn(configStorageActions, "toggleWebAppBool")
        .mockImplementation(jest.fn());
  });

  afterEach(() => {
    moveAbsoluteSpy.mockRestore();
    moveToHomeSpy.mockRestore();
    findHomeSpy.mockRestore();
    setHomeSpy.mockRestore();
    findAxisLengthSpy.mockRestore();
    toggleWebAppBoolSpy.mockRestore();
  });

  const fakeProps = (): BotPositionRowsProps => ({
    getConfigValue: jest.fn(key => mockConfig[key]),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    locationData: cloneDeep(bot.hardware.location_data),
    arduinoBusy: false,
    firmwareSettings: {},
    firmwareHardware: undefined,
    botOnline: true,
    locked: false,
    dispatch: jest.fn(),
  });

  it("inputs axis destination", () => {
    const wrapper = shallow(<BotPositionRows {...fakeProps()} />);
    const axisInput = wrapper.find("AxisInputBoxGroup");
    axisInput.simulate("commit", "123");
    expect(deviceActions.moveAbsolute).toHaveBeenCalledWith("123");
  });

  it("shows encoder position", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    mockConfig[BooleanSetting.raw_encoders] = true;
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const wrapper = mount(<BotPositionRows {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("encoder");
  });

  it("doesn't show encoder position", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    mockConfig[BooleanSetting.raw_encoders] = true;
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<BotPositionRows {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("encoder");
  });

  it("goes home", () => {
    const wrapper = mount(<BotPositionRows {...fakeProps()} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 0, "move to home");
    expect(deviceActions.moveToHome).toHaveBeenCalledWith("x");
  });

  it("finds home", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const wrapper = mount(<BotPositionRows {...p} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 1, "find home");
    expect(deviceActions.findHome).toHaveBeenCalledWith("x");
  });

  it("sets zero", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const wrapper = mount(<BotPositionRows {...p} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 2, "set home");
    expect(deviceActions.setHome).toHaveBeenCalledWith("x");
  });

  it("calibrates", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const wrapper = mount(<BotPositionRows {...p} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    clickButton(wrapper, 3, "find length");
    expect(deviceActions.findAxisLength).toHaveBeenCalledWith("x");
  });

  it("navigates to axis settings", () => {
    const wrapper = mount(<BotPositionRows {...fakeProps()} />);
    wrapper.find(".fa-ellipsis-v").first().simulate("click");
    wrapper.find(".axis-actions a").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("axes"));
  });
});
