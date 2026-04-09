const mockDevice = { emergencyUnlock: jest.fn(() => Promise.resolve()) };

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import * as deviceModule from "../../device";
import { EStopButton } from "../e_stop_btn";
import { bot } from "../../__test_support__/fake_state/bot";
import { EStopButtonProps } from "../interfaces";
import * as screenSize from "../../screen_size";
import { cloneDeep } from "lodash";

let getDeviceSpy: jest.SpyInstance;
let maybeGetDeviceSpy: jest.SpyInstance;
let fetchNewDeviceSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;

beforeEach(() => {
  mockDevice.emergencyUnlock.mockClear();
  getDeviceSpy = jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as unknown as import("farmbot").Farmbot);
  maybeGetDeviceSpy = jest.spyOn(deviceModule, "maybeGetDevice")
    .mockImplementation(() => mockDevice as unknown as import("farmbot").Farmbot);
  fetchNewDeviceSpy = jest.spyOn(deviceModule, "fetchNewDevice")
    .mockImplementation(() =>
      Promise.resolve(mockDevice as unknown as import("farmbot").Farmbot));
  isMobileSpy = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
});

afterEach(() => {
  getDeviceSpy.mockRestore();
  maybeGetDeviceSpy.mockRestore();
  fetchNewDeviceSpy.mockRestore();
  isMobileSpy.mockRestore();
});
describe("<EStopButton />", () => {
  const fakeProps = (): EStopButtonProps =>
    ({ bot: cloneDeep(bot), forceUnlock: false });
  it("renders", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    const { container } = render(<EStopButton {...p} />);
    expect(container.textContent).toEqual("E-STOP");
    expect(container.querySelector("button")?.className).toContain("red");
  });

  it("is grayed out when offline", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = undefined;
    const { container } = render(<EStopButton {...p} />);
    expect(container.textContent).toEqual("E-STOP");
    expect(container.querySelector("button")?.className)
      .toContain("pseudo-disabled");
  });

  it("shows locked state", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.hardware.informational_settings.locked = true;
    const { container } = render(<EStopButton {...p} />);
    expect(container.textContent).toEqual("UNLOCK");
    expect(container.querySelector("button")?.className).toContain("yellow");
  });

  it("confirms unlock", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.hardware.informational_settings.locked = true;
    p.forceUnlock = false;
    window.confirm = jest.fn(() => false);
    const { container } = render(<EStopButton {...p} />);
    expect(container.textContent).toEqual("UNLOCK");
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).toHaveBeenCalledWith(
      "Are you sure you want to unlock the device?");
    expect(mockDevice.emergencyUnlock).not.toHaveBeenCalled();
  });

  it("doesn't confirm unlock", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.hardware.informational_settings.locked = true;
    p.forceUnlock = true;
    window.confirm = jest.fn(() => false);
    const { container } = render(<EStopButton {...p} />);
    expect(container.textContent).toEqual("UNLOCK");
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).not.toHaveBeenCalled();
    expect(mockDevice.emergencyUnlock).toHaveBeenCalled();
  });
});
