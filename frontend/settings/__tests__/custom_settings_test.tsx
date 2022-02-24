let mockDev = false;
jest.mock("../../settings/dev/dev_support", () => ({
  DevSettings: {
    showInternalEnvsEnabled: () => mockDev,
  }
}));

import React from "react";
import { mount } from "enzyme";
import { CustomSettings } from "../custom_settings";
import { CustomSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../__test_support__/panel_state";

describe("<CustomSettings />", () => {
  const fakeProps = (): CustomSettingsProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    farmwareEnvs: [],
  });

  it("renders envs", () => {
    const p = fakeProps();
    p.settingsPanelState.custom_settings = true;
    const wrapper = mount(<CustomSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("custom");
    expect(wrapper.text().toLowerCase()).not.toContain("internal");
  });

  it("renders internal envs", () => {
    mockDev = true;
    const p = fakeProps();
    p.settingsPanelState.custom_settings = true;
    const wrapper = mount(<CustomSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("custom");
    expect(wrapper.text().toLowerCase()).toContain("internal");
  });
});
