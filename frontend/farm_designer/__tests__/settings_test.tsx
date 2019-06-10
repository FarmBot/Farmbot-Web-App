jest.mock("react-redux", () => ({ connect: jest.fn() }));

jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(() => jest.fn(() => true)),
  setWebAppConfigValue: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  DesignerSettings, DesignerSettingsProps, mapStateToProps
} from "../settings";
import { fakeState } from "../../__test_support__/fake_state";
import { BooleanSetting } from "../../session_keys";
import { setWebAppConfigValue } from "../../config_storage/actions";

describe("<DesignerSettings />", () => {
  const fakeProps = (): DesignerSettingsProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
  });

  it("renders settings", () => {
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    expect(wrapper.text()).toContain("size");
  });

  it("toggles setting", () => {
    const wrapper = mount(<DesignerSettings {...fakeProps()} />);
    wrapper.find("button").at(1).simulate("click");
    expect(setWebAppConfigValue)
      .toHaveBeenCalledWith(BooleanSetting.display_trail, true);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    const value = props.getConfigValue(BooleanSetting.show_plants);
    expect(value).toEqual(true);
  });
});
