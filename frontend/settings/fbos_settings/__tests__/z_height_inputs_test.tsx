jest.mock("../../default_values", () => ({
  getModifiedClassNameSpecifyModified: (x: boolean) => x ? "modified" : "",
}));

import React from "react";
import { render } from "@testing-library/react";
import { GantryHeight, SafeHeight, SoilHeight } from "../z_height_inputs";
import { ZHeightInputProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FirmwareHardware } from "farmbot";

afterAll(() => {
  jest.unmock("../../default_values");
});
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
    bot.hardware.configuration.gantry_height = value;
    const { container } = render(<GantryHeight {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).toContain("gantry height");
    expect(container.querySelector(".input")?.className.includes("modified"))
      .toBeFalsy();
  });

  it("renders: modified", () => {
    bot.hardware.configuration.firmware_hardware = "arduino";
    bot.hardware.configuration.gantry_height = 100;
    const { container } = render(<GantryHeight {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).toContain("gantry height");
    expect(container.querySelector(".input")?.className.includes("modified"))
      .toBeTruthy();
  });
});

describe("<SafeHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<SafeHeight {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).toContain("safe height");
  });
});

describe("<SoilHeight />", () => {
  const fakeProps = (): ZHeightInputProps => ({
    sourceFbosConfig: () => ({ value: 10, consistent: true }),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<SoilHeight {...fakeProps()} />);
    expect((container.textContent || "").toLowerCase()).toContain("soil height");
  });
});
