jest.mock("../../default_values", () => ({
  getModifiedClassNameSpecifyModified: (x: boolean) => x ? "modified" : "",
}));

import React from "react";
import { mount } from "enzyme";
import { GantryHeight, SafeHeight, SoilHeight } from "../z_height_inputs";
import { ZHeightInputProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FirmwareHardware, FullConfiguration } from "farmbot";

describe("<GantryHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    dispatch: jest.fn(),
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 120],
    ["express_k10", 140],
  ])("renders: %s", (firmwareHardware, value) => {
    bot.hardware.configuration.firmware_hardware = firmwareHardware;
    bot.hardware.configuration["gantry_height" as keyof FullConfiguration] =
      value as never;
    const wrapper = mount(<GantryHeight {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("gantry height");
    expect(wrapper.find(".input").hasClass("modified")).toBeFalsy();
  });

  it("renders: modified", () => {
    bot.hardware.configuration.firmware_hardware = "arduino";
    bot.hardware.configuration["gantry_height" as keyof FullConfiguration] =
      100 as never;
    const wrapper = mount(<GantryHeight {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("gantry height");
    expect(wrapper.find(".input").hasClass("modified")).toBeTruthy();
  });
});

describe("<SafeHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SafeHeight {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("safe height");
  });
});

describe("<SoilHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<SoilHeight {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("soil height");
  });
});
