jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(() => jest.fn()),
  setWebAppConfigValue: jest.fn(),
}));

import React from "react";
import { MapSizeInputs, MapSizeInputsProps } from "../map_size_setting";
import { render, screen } from "@testing-library/react";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { NumericSetting } from "../../session_keys";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";

describe("<MapSizeInputs />", () => {
  const fakeProps = (config: WebAppConfig): MapSizeInputsProps => {
    return {
      getConfigValue: key => config[key],
      dispatch: jest.fn(),
    };
  };

  it("changes value", () => {
    const config = fakeWebAppConfig();
    const p = fakeProps(config.body);
    render(<MapSizeInputs {...p} />);
    const input = screen.getByDisplayValue("" + config.body.map_size_y);
    changeBlurableInputRTL(input, "100");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.map_size_y, "100");
  });
});
