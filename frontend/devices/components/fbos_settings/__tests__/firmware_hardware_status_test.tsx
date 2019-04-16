jest.mock("../../../actions", () => ({
  flashFirmware: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  FirmwareHardwareStatusDetailsProps, FirmwareHardwareStatusDetails,
  FirmwareHardwareStatusIconProps, FirmwareHardwareStatusIcon,
  FirmwareHardwareStatusProps, FirmwareHardwareStatus,
  FirmwareActions, FirmwareActionsProps
} from "../firmware_hardware_status";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { clickButton } from "../../../../__test_support__/helpers";
import { flashFirmware } from "../../../actions";
import { fakeTimeSettings } from "../../../../__test_support__/fake_time_settings";

describe("<FirmwareHardwareStatusDetails />", () => {
  const fakeProps = (): FirmwareHardwareStatusDetailsProps => ({
    bot,
    botOnline: true,
    apiFirmwareValue: undefined,
    botFirmwareValue: undefined,
    mcuFirmwareValue: undefined,
    shouldDisplay: () => true,
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

describe("<FirmwareHardwareStatusIcon />", () => {
  const fakeProps = (): FirmwareHardwareStatusIconProps => ({
    firmwareHardware: undefined,
    status: false,
  });

  it("renders details: ok", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    p.status = true;
    const wrapper = mount(<FirmwareHardwareStatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("ok")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-check-circle")).toEqual(true);
  });

  it("renders details: inconsistent", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    p.status = false;
    const wrapper = mount(<FirmwareHardwareStatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("no")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-times-circle")).toEqual(true);
  });

  it("renders details: unknown", () => {
    const p = fakeProps();
    p.firmwareHardware = undefined;
    const wrapper = mount(<FirmwareHardwareStatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("unknown")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-question-circle")).toEqual(true);
  });
});

describe("<FirmwareHardwareStatus />", () => {
  const fakeProps = (): FirmwareHardwareStatusProps => ({
    bot,
    botOnline: true,
    apiFirmwareValue: undefined,
    shouldDisplay: () => true,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
  });

  it("renders: inconsistent", () => {
    const wrapper = mount(<FirmwareHardwareStatus {...fakeProps()} />);
    expect(wrapper.find(FirmwareHardwareStatusIcon).props().status).toBeFalsy();
  });

  it("renders: consistent", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.firmware_version = "1.0.0.R";
    p.bot.hardware.configuration.firmware_hardware = "arduino";
    p.apiFirmwareValue = "arduino";
    const wrapper = mount(<FirmwareHardwareStatus {...p} />);
    expect(wrapper.find(FirmwareHardwareStatusIcon).props().status).toBeTruthy();
  });
});

describe("<FirmwareActions />", () => {
  const fakeProps = (): FirmwareActionsProps => ({
    botOnline: true,
    apiFirmwareValue: "arduino",
  });

  it("flashes firmware", () => {
    const wrapper = mount(<FirmwareActions {...fakeProps()} />);
    clickButton(wrapper, 0, "flash firmware");
    expect(flashFirmware).toHaveBeenCalledWith("arduino");
  });
});
