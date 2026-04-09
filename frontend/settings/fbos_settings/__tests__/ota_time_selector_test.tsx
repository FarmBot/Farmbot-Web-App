import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  OtaTimeSelector, OtaTimeSelectorRow, DDI_ASAP,
  localHourToUtcHour, utcHourToLocalHour,
} from "../ota_time_selector";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { OtaTimeSelectorProps, OtaTimeSelectorRowProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import * as crud from "../../../api/crud";
import * as deviceActions from "../../../devices/actions";
import * as ui from "../../../ui";
import { FBSelectProps } from "../../../ui";

let editSpy: jest.SpyInstance;
let updateConfigSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;

beforeEach(() => {
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) =>
      <div>
        <span data-testid="selected-item">
          {props.selectedItem ? JSON.stringify(props.selectedItem) : ""}
        </span>
        <span data-testid="select-list">{JSON.stringify(props.list)}</span>
        <button onClick={() =>
          props.onChange({ label: "at 5 PM", value: 17 })}>
          select-17
        </button>
        <button onClick={() => props.onChange(
          undefined as unknown as Parameters<FBSelectProps["onChange"]>[0])}>
          select-none
        </button>
        <button onClick={() =>
          props.onChange({ label: "", value: "never" })}>
          select-never
        </button>
      </div>) as never);
});

afterEach(() => {
  fbSelectSpy.mockRestore();
});

describe("localHourToUtcHour()", () => {
  it("converts hour", () => {
    expect(localHourToUtcHour(10, -2)).toEqual(12);
  });
});

describe("utcHourToLocalHour()", () => {
  it("converts hour", () => {
    expect(utcHourToLocalHour(12, -2)).toEqual(10);
  });
});

describe("<OtaTimeSelector />", () => {
  const fakeProps = (): OtaTimeSelectorProps => ({
    timeSettings: fakeTimeSettings(),
    device: fakeDevice(),
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
  });

  it("renders the default value", () => {
    const p = fakeProps();
    p.device.body.ota_hour = undefined;
    render(<OtaTimeSelector {...p} />);
    expect(screen.getByTestId("selected-item").textContent).toEqual("");
    expect(screen.getByTestId("select-list").textContent)
      .toContain(DDI_ASAP().label);
  });

  it("renders the current value", () => {
    const p = fakeProps();
    p.device.body.ota_hour = 17;
    render(<OtaTimeSelector {...p} />);
    expect(screen.getByTestId("selected-item").textContent)
      .toEqual(JSON.stringify({ label: "5:00 PM", value: 17 }));
    expect(screen.getByTestId("selected-item").textContent)
      .not.toContain(DDI_ASAP().label);
  });

  it("renders the current value using UTC data", () => {
    const p = fakeProps();
    p.device.body.ota_hour_utc = 17;
    render(<OtaTimeSelector {...p} />);
    expect(screen.getByTestId("selected-item").textContent)
      .toEqual(JSON.stringify({ label: "5:00 PM", value: 17 }));
    expect(screen.getByTestId("selected-item").textContent)
      .not.toContain(DDI_ASAP().label);
  });

  it("selects an OTA update time", () => {
    const p = fakeProps();
    render(<OtaTimeSelector {...p} />);
    fireEvent.click(screen.getByText("select-17"));
    expect(editSpy).toHaveBeenCalledWith(p.device,
      { ota_hour: 17, ota_hour_utc: 17 });
  });

  it("unselects an OTA update time", () => {
    const p = fakeProps();
    render(<OtaTimeSelector {...p} />);
    fireEvent.click(screen.getByText("select-none"));
    expect(editSpy).toHaveBeenCalledWith(p.device,
      { ota_hour: undefined, ota_hour_utc: undefined });
    expect(updateConfigSpy).not.toHaveBeenCalled();
  });

  it("selects never", () => {
    const p = fakeProps();
    render(<OtaTimeSelector {...p} />);
    fireEvent.click(screen.getByText("select-never"));
    expect(editSpy).not.toHaveBeenCalled();
    expect(updateConfigSpy).toHaveBeenCalledWith({ os_auto_update: false });
  });

  it("enables auto update", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: false, consistent: false });
    render(<OtaTimeSelector {...p} />);
    fireEvent.click(screen.getByText("select-17"));
    expect(editSpy).toHaveBeenCalledWith(p.device,
      { ota_hour: 17, ota_hour_utc: 17 });
    expect(updateConfigSpy).toHaveBeenCalledWith({ os_auto_update: true });
  });
});

describe("<OtaTimeSelectorRow />", () => {
  const fakeProps = (): OtaTimeSelectorRowProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: "", consistent: true }),
    device: fakeDevice(),
    timeSettings: fakeTimeSettings(),
    showAdvanced: true,
  });

  it("shows 12h formatted times", () => {
    const p = fakeProps();
    p.timeSettings.hour24 = false;
    render(<OtaTimeSelectorRow {...p} />);
    expect(screen.getByTestId("select-list").textContent)
      .toContain(JSON.stringify({ label: "8:00 PM", value: 20 }));
  });

  it("shows 24h formatted times", () => {
    const p = fakeProps();
    p.timeSettings.hour24 = true;
    render(<OtaTimeSelectorRow {...p} />);
    expect(screen.getByTestId("select-list").textContent)
      .toContain(JSON.stringify({ label: "20:00", value: 20 }));
  });
});
