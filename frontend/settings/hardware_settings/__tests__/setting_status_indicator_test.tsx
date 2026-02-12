import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  SettingStatusIndicator,
  SettingStatusIndicatorProps,
} from "../setting_status_indicator";
import * as exportMenu from "../export_menu";

let resendParametersSpy: jest.SpyInstance;

beforeEach(() => {
  resendParametersSpy = jest.spyOn(exportMenu, "resendParameters")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  resendParametersSpy.mockRestore();
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
    const icon = container.querySelector(".fa-exclamation-triangle");
    icon && fireEvent.click(icon);
    expect(exportMenu.resendParameters).toHaveBeenCalled();
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
