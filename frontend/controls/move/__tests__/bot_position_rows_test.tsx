import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BotPositionRows } from "../bot_position_rows";
import { BotPositionRowsProps } from "../interfaces";
import * as deviceActions from "../../../devices/actions";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Dictionary } from "farmbot";
import { BooleanSetting } from "../../../session_keys";
import { changeBlurableInputRTL } from "../../../__test_support__/helpers";
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
    const { container } = render(<BotPositionRows {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    changeBlurableInputRTL(inputs[0] as HTMLInputElement, "123");
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(deviceActions.moveAbsolute).toHaveBeenCalledWith({
      x: 123, y: 0, z: 0,
    });
  });

  it("shows encoder position", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    mockConfig[BooleanSetting.raw_encoders] = true;
    const p = fakeProps();
    p.firmwareHardware = undefined;
    render(<BotPositionRows {...p} />);
    expect(screen.getAllByText(/encoder/i).length).toBeGreaterThan(0);
  });

  it("doesn't show encoder position", () => {
    mockConfig[BooleanSetting.scaled_encoders] = true;
    mockConfig[BooleanSetting.raw_encoders] = true;
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    render(<BotPositionRows {...p} />);
    expect(screen.queryByText(/encoder/i)).not.toBeInTheDocument();
  });

  it("goes home", () => {
    const { container } = render(<BotPositionRows {...fakeProps()} />);
    const menu = container.querySelector(".fa-ellipsis-v");
    expect(menu).toBeTruthy();
    menu && fireEvent.click(menu);
    fireEvent.click(screen.getAllByText(/move to home/i)[0]);
    expect(deviceActions.moveToHome).toHaveBeenCalledWith("x");
  });

  it("finds home", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const { container } = render(<BotPositionRows {...p} />);
    const menu = container.querySelector(".fa-ellipsis-v");
    expect(menu).toBeTruthy();
    menu && fireEvent.click(menu);
    fireEvent.click(screen.getAllByText(/find home/i)[0]);
    expect(deviceActions.findHome).toHaveBeenCalledWith("x");
  });

  it("sets zero", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const { container } = render(<BotPositionRows {...p} />);
    const menu = container.querySelector(".fa-ellipsis-v");
    expect(menu).toBeTruthy();
    menu && fireEvent.click(menu);
    fireEvent.click(screen.getAllByText(/set home/i)[0]);
    expect(deviceActions.setHome).toHaveBeenCalledWith("x");
  });

  it("calibrates", () => {
    const p = fakeProps();
    p.firmwareSettings["encoder_enabled_x"] = 1;
    const { container } = render(<BotPositionRows {...p} />);
    const menu = container.querySelector(".fa-ellipsis-v");
    expect(menu).toBeTruthy();
    menu && fireEvent.click(menu);
    fireEvent.click(screen.getAllByText(/find length/i)[0]);
    expect(deviceActions.findAxisLength).toHaveBeenCalledWith("x");
  });

  it("navigates to axis settings", () => {
    const { container } = render(<BotPositionRows {...fakeProps()} />);
    const menu = container.querySelector(".fa-ellipsis-v");
    expect(menu).toBeTruthy();
    menu && fireEvent.click(menu);
    fireEvent.click(screen.getAllByText("Settings")[0]);
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("axes"));
  });
});
