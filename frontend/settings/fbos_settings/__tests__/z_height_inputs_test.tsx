import React from "react";
import { render } from "@testing-library/react";
import { GantryHeight, SafeHeight, SoilHeight } from "../z_height_inputs";
import { ZHeightInputProps } from "../interfaces";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FirmwareHardware } from "farmbot";
import { cloneDeep } from "lodash";
import * as defaultValues from "../../default_values";

let modifiedClassNameSpy: jest.SpyInstance;

describe("<GantryHeight />", () => {
  beforeEach(() => {
    modifiedClassNameSpy =
      jest.spyOn(defaultValues, "getModifiedClassNameSpecifyModified")
        .mockImplementation((x: boolean) => x ? "modified" : "");
  });

  afterEach(() => {
    modifiedClassNameSpy.mockRestore();
  });

  const fakeProps = (
    configuration = cloneDeep(bot.hardware.configuration),
  ): ZHeightInputProps => ({
    sourceFbosConfig: x => ({ value: configuration[x], consistent: true }),
    dispatch: jest.fn(),
  });

  it.each<[FirmwareHardware, number]>([
    ["arduino", 120],
    ["express_k10", 140],
  ])("renders: %s", (firmwareHardware, value) => {
    modifiedClassNameSpy.mockClear();
    const configuration = cloneDeep(bot.hardware.configuration);
    configuration.firmware_hardware = firmwareHardware;
    configuration.gantry_height = value;
    const { container } = render(<GantryHeight {...fakeProps(configuration)} />);
    expect((container.textContent || "").toLowerCase()).toContain("gantry height");
    expect(modifiedClassNameSpy).toHaveBeenCalledWith(false);
  });

  it("renders: modified", () => {
    modifiedClassNameSpy.mockClear();
    const configuration = cloneDeep(bot.hardware.configuration);
    configuration.firmware_hardware = "arduino";
    configuration.gantry_height = 100;
    const { container } = render(<GantryHeight {...fakeProps(configuration)} />);
    expect((container.textContent || "").toLowerCase()).toContain("gantry height");
    expect(modifiedClassNameSpy).toHaveBeenCalledWith(true);
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
