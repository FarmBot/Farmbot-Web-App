import React from "react";
import { render } from "@testing-library/react";
import {
  FirmwareHardwareStatusDetailsProps, FirmwareHardwareStatusDetails,
  StatusIconProps, StatusIcon,
  FirmwareHardwareStatusProps, FirmwareHardwareStatus,
} from "../firmware_hardware_status";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import * as deviceActions from "../../../devices/actions";

beforeEach(() => {
  jest.spyOn(deviceActions, "flashFirmware").mockImplementation(jest.fn());
});

describe("<FirmwareHardwareStatusDetails />", () => {
  const fakeProps = (): FirmwareHardwareStatusDetailsProps => ({
    alerts: [],
    botOnline: true,
    apiFirmwareValue: undefined,
    botFirmwareValue: undefined,
    mcuFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
  });

  it("renders details: unknown", () => {
    const { container } = render(<FirmwareHardwareStatusDetails {...fakeProps()} />);
    expect(container.textContent).toContain("unknown");
  });

  it("renders details: arduino", () => {
    const p = fakeProps();
    p.apiFirmwareValue = "arduino";
    const { container } = render(<FirmwareHardwareStatusDetails {...p} />);
    expect(container.textContent).toContain("Arduino/RAMPS (Genesis v1.2)");
  });
});

describe("<StatusIcon />", () => {
  const fakeProps = (): StatusIconProps => ({
    available: false,
    status: false,
  });

  it("renders details: ok", () => {
    const p = fakeProps();
    p.available = true;
    p.status = true;
    const { container } = render(<StatusIcon {...p} />);
    const icon = container.querySelector("i");
    expect(icon?.classList.contains("ok")).toEqual(true);
    expect(icon?.classList.contains("fa-check-circle")).toEqual(true);
  });

  it("renders details: inconsistent", () => {
    const p = fakeProps();
    p.available = true;
    p.status = false;
    const { container } = render(<StatusIcon {...p} />);
    const icon = container.querySelector("i");
    expect(icon?.classList.contains("no")).toEqual(true);
    expect(icon?.classList.contains("fa-times-circle")).toEqual(true);
  });

  it("renders details: unknown", () => {
    const p = fakeProps();
    p.available = false;
    const { container } = render(<StatusIcon {...p} />);
    const icon = container.querySelector("i");
    expect(icon?.classList.contains("unknown")).toEqual(true);
    expect(icon?.classList.contains("fa-question-circle")).toEqual(true);
  });
});

describe("<FirmwareHardwareStatus />", () => {
  const fakeProps = (): FirmwareHardwareStatusProps => ({
    bot,
    alerts: [],
    botOnline: true,
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
  });

  it("renders: inconsistent", () => {
    const { container } = render(<FirmwareHardwareStatus {...fakeProps()} />);
    const icon = container.querySelector(".status-icon");
    expect(icon?.classList.contains("ok")).toBeFalsy();
  });

  it("renders: consistent", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "1.0.0.R";
    p.bot.hardware.configuration.firmware_hardware = "arduino";
    p.apiFirmwareValue = "arduino";
    const { container } = render(<FirmwareHardwareStatus {...p} />);
    const icon = container.querySelector(".status-icon");
    expect(icon?.classList.contains("ok")).toBeTruthy();
  });
});
