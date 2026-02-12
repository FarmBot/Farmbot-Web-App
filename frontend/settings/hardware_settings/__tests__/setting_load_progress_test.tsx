import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  SettingLoadProgress, SettingLoadProgressProps,
} from "../setting_load_progress";
import { SourceFwConfig } from "../../../devices/interfaces";
import {
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import type { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { Color } from "../../../ui";

describe("<SettingLoadProgress />", () => {
  const fakeProps =
    (extraConfig?: keyof FirmwareConfig): SettingLoadProgressProps => {
      type ConsistencyLookup = Record<keyof FirmwareConfig, boolean>;
      const consistent: Partial<ConsistencyLookup> = ({
        id: false, movement_motor_current_x: true, encoder_enabled_x: true,
        encoder_enabled_y: false,
      });
      extraConfig && (consistent[extraConfig] = false);
      const consistencyLookup = consistent as ConsistencyLookup;
      const fakeConfig: Partial<FirmwareConfig> = ({
        id: 0, movement_motor_current_x: 1, encoder_enabled_x: 0,
        encoder_enabled_y: 0,
      });
      extraConfig && (fakeConfig[extraConfig] = 0 as unknown as undefined);
      const firmwareConfig = fakeConfig as FirmwareConfig;
      const sourceFwConfig = ((x: keyof FirmwareConfig) => ({
        value: firmwareConfig?.[x], consistent: consistencyLookup[x]
      })) as SourceFwConfig;
      return {
        botOnline: true,
        sourceFwConfig,
        firmwareConfig,
        firmwareHardware: undefined,
      };
    };

  it("shows setting load progress: 50%", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    const { container } = render(<SettingLoadProgress {...p} />);
    const bar = container.querySelector(".load-progress-bar");
    expect(bar?.getAttribute("style")).toContain("width: 50%");
    expect(bar?.getAttribute("style")).toContain(`background: ${Color.white}`);
  });

  it("shows setting load progress: 67%", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k15";
    const { container } = render(<SettingLoadProgress {...p} />);
    const bar = container.querySelector(".load-progress-bar");
    expect(bar?.getAttribute("style")).toContain("width: 67%");
    expect(bar?.getAttribute("style")).toContain(`background: ${Color.white}`);
  });

  it("shows setting load progress: 0%", () => {
    const p = fakeProps();
    p.botOnline = false;
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.sourceFwConfig = () => ({ value: 0, consistent: false });
    const { container } = render(<SettingLoadProgress {...p} />);
    const bar = container.querySelector(".load-progress-bar");
    expect(bar?.getAttribute("style")).toContain("width: 0%");
    expect(bar?.getAttribute("style"))
      .toContain(`background: ${Color.darkGray}`);
    expect(container.textContent).toEqual("0% (offline)");
  });

  it("shows setting load progress: 100%", () => {
    const p = fakeProps();
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.sourceFwConfig = () => ({ value: 0, consistent: true });
    const { container } = render(<SettingLoadProgress {...p} />);
    const bar = container.querySelector(".load-progress-bar");
    expect(bar?.getAttribute("style")).toContain("width: 100%");
    expect(bar?.getAttribute("style"))
      .toContain(`background: ${Color.darkGray}`);
  });

  it("logs loading items", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
    const p = fakeProps();
    const { container } = render(<SettingLoadProgress {...p} />);
    const wrapper = container.querySelector(".load-progress-bar-wrapper");
    wrapper && fireEvent.click(wrapper);
    expect(console.log).toHaveBeenCalledWith(["encoder_enabled_y"]);
    consoleSpy.mockRestore();
  });
});
