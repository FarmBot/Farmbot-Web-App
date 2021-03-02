const actions = require("../../../config_storage/actions");
actions.toggleWebAppBool = jest.fn();

import React from "react";
import { mount } from "enzyme";
import { BooleanSetting } from "../../../session_keys";
import {
  moveWidgetSetting, MoveWidgetSettingsMenu, MoveWidgetSettingsMenuProps,
} from "../settings_menu";
import { DeviceSetting } from "../../../constants";
import { toggleWebAppBool } from "../../../config_storage/actions";

describe("moveWidgetSetting()", () => {
  it("toggles setting", () => {
    const Setting = moveWidgetSetting(jest.fn(), jest.fn(() => true));
    const wrapper = mount(<Setting
      label={DeviceSetting.invertJogButtonXAxis}
      setting={BooleanSetting.xy_swap} />);
    ["x axis", "yes"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    wrapper.find("button").simulate("click");
    expect(toggleWebAppBool).toHaveBeenCalledWith(BooleanSetting.xy_swap);
  });
});

describe("<MoveWidgetSettingsMenu />", () => {
  const fakeProps = (): MoveWidgetSettingsMenuProps => ({
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    firmwareHardware: undefined,
  });

  it("displays motor plot toggle", () => {
    const wrapper = mount(<MoveWidgetSettingsMenu {...fakeProps()} />);
    expect(wrapper.text()).toContain("Motor position plot");
  });

  it("displays encoder toggles", () => {
    const wrapper = mount(<MoveWidgetSettingsMenu {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("encoder");
  });

  it("doesn't display encoder toggles", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = mount(<MoveWidgetSettingsMenu {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("encoder");
  });
});
