jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RpiModel, RpiModelProps, StatusDetails, StatusDetailsProps,
} from "../rpi_model";
import { edit, save } from "../../../api/crud";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { FBSelect } from "../../../ui";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FirmwareHardware } from "farmbot";

type TestCase = [string, string, FirmwareHardware, string];

const TEST_CASES: TestCase[] = [
  ["3", "rpi3", "arduino", "pi 3"],
  ["4", "rpi4", "farmduino_k16", "pi 4"],
  ["4", "rpi4", "farmduino_k17", "pi 4"],
  ["4", "rpi4", "farmduino_k18", "pi 4"],
  ["01", "rpi", "express_k10", "zero w"],
  ["02", "rpi3", "express_k11", "zero 2 w"],
  ["02", "rpi3", "express_k12", "zero 2 w"],
];

describe("<RpiModel />", () => {
  const fakeProps = (): RpiModelProps => ({
    device: fakeDevice(),
    firmwareHardware: "arduino",
    showAdvanced: true,
    dispatch: jest.fn(),
    bot,
  });

  it("changes rpi model", () => {
    const p = fakeProps();
    const wrapper = shallow(<RpiModel {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: "3" });
    expect(edit).toHaveBeenCalledWith(p.device, { rpi: "3" });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("shows error", () => {
    const p = fakeProps();
    p.device.body.rpi = "3";
    p.bot.hardware.informational_settings.target = "rpi";
    const wrapper = mount(<RpiModel {...p} />);
    expect(wrapper.html()).toContain("fa-times-circle");
  });

  it("shows error: no selection", () => {
    const p = fakeProps();
    p.device.body.rpi = undefined;
    p.bot.hardware.informational_settings.target = "rpi";
    const wrapper = mount(<RpiModel {...p} />);
    expect(wrapper.html()).toContain("fa-times-circle");
  });

  it.each(TEST_CASES)("doesn't show error: %s %s",
    (selection, target, _firmwareHardware, _expected) => {
      const p = fakeProps();
      p.device.body.rpi = selection;
      p.bot.hardware.informational_settings.target = target;
      const wrapper = mount(<RpiModel {...p} />);
      expect(wrapper.html()).not.toContain("fa-times-circle");
    });
});

describe("<StatusDetails />", () => {
  const fakeProps = (): StatusDetailsProps => ({
    selection: "3",
    target: "rpi3",
    firmwareHardware: "arduino",
  });

  it.each(TEST_CASES)("renders details: %s %s %s %s",
    (selection, target, firmwareHardware, expected) => {
      const p = fakeProps();
      p.selection = selection;
      p.target = target;
      p.firmwareHardware = firmwareHardware;
      const wrapper = mount(<StatusDetails {...p} />);
      expect(wrapper.text().toLowerCase()).toContain(expected);
    });

  it("renders unknown", () => {
    const p = fakeProps();
    p.selection = undefined;
    p.target = "";
    p.firmwareHardware = undefined;
    const wrapper = mount(<StatusDetails {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("unknown");
  });
});
