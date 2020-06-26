import * as React from "react";
import { mount } from "enzyme";
import { BooleanSetting } from "../../../session_keys";
import {
  moveWidgetSetting, MoveWidgetSettingsMenu, MoveWidgetSettingsMenuProps,
} from "../settings_menu";

describe("moveWidgetSetting()", () => {
  it("renders setting", () => {
    const Setting = moveWidgetSetting(jest.fn(), jest.fn(() => true));
    const wrapper = mount(<Setting
      label="label"
      setting={BooleanSetting.xy_swap} />);
    ["label", "yes"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });
});

describe("<MoveWidgetSettingsMenu />", () => {
  const fakeProps = (): MoveWidgetSettingsMenuProps => ({
    toggle: jest.fn(),
    getValue: jest.fn(),
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
