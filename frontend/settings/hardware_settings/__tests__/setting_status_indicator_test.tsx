import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  SettingStatusIndicator,
  type SettingStatusIndicatorProps,
} from "../setting_status_indicator";
import * as mustBeOnline from "../../../devices/must_be_online";

let forceOnlineSpy: jest.SpyInstance;

beforeEach(() => {
  forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline")
    .mockReturnValue(false);
});

afterEach(() => {
  forceOnlineSpy.mockRestore();
});

describe("<SettingStatusIndicator />", () => {
  const fakeProps = (): SettingStatusIndicatorProps => ({
    dispatch: jest.fn(),
    wasSyncing: false,
    isSyncing: undefined,
  });

  it("re-sends parameters", () => {
    const p = fakeProps();
    p.wasSyncing = false;
    p.isSyncing = true;
    const { container } = render(<SettingStatusIndicator {...p} />);
    const icon = container.querySelector("[title=\"Save error. Click to retry.\"]")
      || container.querySelector(".fa-exclamation-triangle")
      || container.querySelector(".setting-status-indicator i");
    expect(icon).toBeTruthy();
    fireEvent.click(icon as Element);
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    const [action] = (p.dispatch as jest.Mock).mock.calls[0] || [];
    expect(typeof action).toEqual("function");
  });

  it("displays spinner", () => {
    const p = fakeProps();
    p.wasSyncing = true;
    p.isSyncing = true;
    const { container } = render(<SettingStatusIndicator {...p} />);
    expect(container.querySelectorAll(".fa-spinner").length).toEqual(1);
  });

  it("displays check", () => {
    const p = fakeProps();
    p.wasSyncing = true;
    p.isSyncing = false;
    const { container } = render(<SettingStatusIndicator {...p} />);
    expect(container.querySelectorAll(".fa-check").length).toEqual(1);
  });
});
