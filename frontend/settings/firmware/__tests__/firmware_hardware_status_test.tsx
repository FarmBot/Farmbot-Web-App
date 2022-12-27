jest.mock("../../../devices/actions", () => ({
  flashFirmware: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import {
  FirmwareHardwareStatusDetailsProps, FirmwareHardwareStatusDetails,
  StatusIconProps, StatusIcon,
  FirmwareHardwareStatusProps, FirmwareHardwareStatus,
} from "../firmware_hardware_status";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

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
    const wrapper = mount(<FirmwareHardwareStatusDetails {...fakeProps()} />);
    expect(wrapper.text()).toContain("unknown");
  });

  it("renders details: arduino", () => {
    const p = fakeProps();
    p.apiFirmwareValue = "arduino";
    const wrapper = mount(<FirmwareHardwareStatusDetails {...p} />);
    expect(wrapper.text()).toContain("Arduino/RAMPS (Genesis v1.2)");
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
    const wrapper = mount(<StatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("ok")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-check-circle")).toEqual(true);
  });

  it("renders details: inconsistent", () => {
    const p = fakeProps();
    p.available = true;
    p.status = false;
    const wrapper = mount(<StatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("no")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-times-circle")).toEqual(true);
  });

  it("renders details: unknown", () => {
    const p = fakeProps();
    p.available = false;
    const wrapper = mount(<StatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("unknown")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-question-circle")).toEqual(true);
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
    const wrapper = mount(<FirmwareHardwareStatus {...fakeProps()} />);
    expect(wrapper.find(StatusIcon).props().status).toBeFalsy();
  });

  it("renders: consistent", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "1.0.0.R";
    p.bot.hardware.configuration.firmware_hardware = "arduino";
    p.apiFirmwareValue = "arduino";
    const wrapper = mount(<FirmwareHardwareStatus {...p} />);
    expect(wrapper.find(StatusIcon).props().status).toBeTruthy();
  });
});
