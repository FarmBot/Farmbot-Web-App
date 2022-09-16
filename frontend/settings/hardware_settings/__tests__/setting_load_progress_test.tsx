import React from "react";
import { mount } from "enzyme";
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
    const wrapper = mount(<SettingLoadProgress {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.width).toEqual("50%");
    expect(barStyle?.background).toEqual(Color.white);
  });

  it("shows setting load progress: 67%", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino_k15";
    const wrapper = mount(<SettingLoadProgress {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.width).toEqual("67%");
    expect(barStyle?.background).toEqual(Color.white);
  });

  it("shows setting load progress: 0%", () => {
    const p = fakeProps();
    p.botOnline = false;
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.sourceFwConfig = () => ({ value: 0, consistent: false });
    const wrapper = mount(<SettingLoadProgress {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.width).toEqual("0%");
    expect(barStyle?.background).toEqual(Color.darkGray);
    expect(wrapper.text()).toEqual("0% (offline)");
  });

  it("shows setting load progress: 100%", () => {
    const p = fakeProps();
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.sourceFwConfig = () => ({ value: 0, consistent: true });
    const wrapper = mount(<SettingLoadProgress {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.width).toEqual("100%");
    expect(barStyle?.background).toEqual(Color.darkGray);
  });

  it("logs loading items", () => {
    console.log = jest.fn();
    const p = fakeProps();
    const wrapper = mount(<SettingLoadProgress {...p} />);
    wrapper.find(".load-progress-bar-wrapper").simulate("click");
    expect(console.log).toHaveBeenCalledWith(["encoder_enabled_y"]);
  });
});
