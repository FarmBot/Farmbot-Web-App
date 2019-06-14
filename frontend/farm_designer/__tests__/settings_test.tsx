jest.mock("react-redux", () => ({ connect: jest.fn() }));

jest.mock("../../config_storage/actions", () => ({
  getWebAppConfigValue: jest.fn(x => { x(); return jest.fn(() => true); }),
  setWebAppConfigValue: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  DesignerSettings, DesignerSettingsProps, mapStateToProps
} from "../settings";
import { fakeState } from "../../__test_support__/fake_state";
import { BooleanSetting, NumericSetting } from "../../session_keys";
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

  it("changes origin", () => {
    const p = fakeProps();
    p.getConfigValue = () => 2;
    const wrapper = mount(<DesignerSettings {...p} />);
    expect(wrapper.find("label").last().text()).toContain("origin");
    wrapper.find("div").last().simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      NumericSetting.bot_origin_quadrant, 4);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    const value = props.getConfigValue(BooleanSetting.show_plants);
    expect(value).toEqual(true);
  });
});
