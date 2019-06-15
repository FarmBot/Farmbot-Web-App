jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn()
}));

import * as React from "react";
import { MapSizeInputs, MapSizeInputsProps } from "../map_size_setting";
import { mount } from "enzyme";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { NumericSetting } from "../../session_keys";

describe("<MapSizeInputs />", () => {
  const fakeProps = (): MapSizeInputsProps => ({
    getConfigValue: () => 100,
    dispatch: jest.fn(),
  });

  it("changes value", () => {
    const wrapper = mount(<MapSizeInputs {...fakeProps()} />);
    wrapper.find("input").last().simulate("change"), {
      currentTarget: { value: 100 }
    };
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.map_size_y, "100");
  });
});
