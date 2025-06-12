jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(() => jest.fn()),
  setWebAppConfigValue: jest.fn(),
}));

import React from "react";
import { MapSizeInputs, MapSizeInputsProps } from "../map_size_setting";
import { render, screen } from "@testing-library/react";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { NumericSetting } from "../../session_keys";
import {
  fakeFirmwareConfig, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

describe("<MapSizeInputs />", () => {
  const fakeProps = (config: WebAppConfig): MapSizeInputsProps => ({
    getConfigValue: key => config[key],
    dispatch: jest.fn(),
    firmwareConfig: fakeFirmwareConfig().body,
  });

  it("changes value", () => {
    const config = fakeWebAppConfig();
    config.body.dynamic_map = false;
    const p = fakeProps(config.body);
    render(<MapSizeInputs {...p} />);
    const input = screen.getByDisplayValue("" + config.body.map_size_y);
    changeBlurableInputRTL(input, "100");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.map_size_y, "100");
  });

  it("handles undefined", () => {
    const config = fakeWebAppConfig();
    config.body.dynamic_map = true;
    const p = fakeProps(config.body);
    p.firmwareConfig = undefined;
    render(<MapSizeInputs {...p} />);
    const input = screen.getByDisplayValue("" + config.body.map_size_y);
    changeBlurableInputRTL(input, "100");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.map_size_y, "100");
  });

  it("enables inputs", () => {
    const config = fakeWebAppConfig();
    config.body.dynamic_map = true;
    const p = fakeProps(config.body);
    const firmwareConfig = fakeFirmwareConfig();
    firmwareConfig.body.movement_axis_nr_steps_x = 1000;
    firmwareConfig.body.movement_axis_nr_steps_y = 1000;
    firmwareConfig.body.movement_stop_at_max_x = 1;
    firmwareConfig.body.movement_stop_at_max_y = 1;
    p.firmwareConfig = firmwareConfig.body;
    render(<MapSizeInputs {...p} />);
    const input = screen.getByDisplayValue("" + config.body.map_size_y);
    changeBlurableInputRTL(input, "100");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.map_size_y, "100");
  });
});
