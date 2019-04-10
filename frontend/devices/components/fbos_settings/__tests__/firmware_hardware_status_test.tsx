import * as React from "react";
import { mount } from "enzyme";
import {
  FirmwareHardwareStatusDetailsProps, FirmwareHardwareStatusDetails,
  FirmwareHardwareStatusIconProps, FirmwareHardwareStatusIcon
} from "../firmware_hardware_status";

describe("<FirmwareHardwareStatusDetails />", () => {
  const fakeProps = (): FirmwareHardwareStatusDetailsProps => ({
    status: false,
    apiFirmwareValue: undefined,
    botFirmwareValue: undefined,
    mcuFirmwareVersion: undefined,
    mcuFirmwareValue: undefined,
  });

  it("renders details: inconsistent", () => {
    const wrapper = mount(<FirmwareHardwareStatusDetails {...fakeProps()} />);
    expect(wrapper.text()).toContain("inconsistent");
  });

  it("renders details: consistent", () => {
    const p = fakeProps();
    p.status = true;
    p.apiFirmwareValue = "arduino";
    p.botFirmwareValue = "arduino";
    p.mcuFirmwareValue = "arduino";
    const wrapper = mount(<FirmwareHardwareStatusDetails {...p} />);
    expect(wrapper.text()).toContain("consistent");
    expect(wrapper.text()).toContain("RAMPS");
  });
});

describe("<FirmwareHardwareStatusIcon />", () => {
  const fakeProps = (): FirmwareHardwareStatusIconProps => ({
    firmwareHardware: undefined,
    ok: false,
  });

  it("renders details: ok", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    p.ok = true;
    const wrapper = mount(<FirmwareHardwareStatusIcon {...p} />);
    expect(wrapper.find("i").hasClass("ok")).toEqual(true);
    expect(wrapper.find("i").hasClass("fa-check-circle")).toEqual(true);
  });

  it("renders details: inconsistent", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    p.ok = false;
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
