let mockDev = false;
import React from "react";
import { render } from "@testing-library/react";
import { CustomSettings } from "../custom_settings";
import { CustomSettingsProps } from "../interfaces";
import { settingsPanelState } from "../../__test_support__/panel_state";
import * as devSupport from "../../settings/dev/dev_support";

let showInternalEnvsEnabledSpy: jest.SpyInstance;

beforeEach(() => {
  mockDev = false;
  showInternalEnvsEnabledSpy = jest.spyOn(devSupport.DevSettings, "showInternalEnvsEnabled")
    .mockImplementation(() => mockDev);
});

afterEach(() => {
  showInternalEnvsEnabledSpy.mockRestore();
});

describe("<CustomSettings />", () => {
  const fakeProps = (): CustomSettingsProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    farmwareEnvs: [],
  });

  it("renders envs", () => {
    const p = fakeProps();
    p.settingsPanelState.custom_settings = true;
    const { container } = render(<CustomSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("custom");
    expect(container.textContent?.toLowerCase()).not.toContain("internal");
  });

  it("renders internal envs", () => {
    mockDev = true;
    const p = fakeProps();
    p.settingsPanelState.custom_settings = true;
    const { container } = render(<CustomSettings {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("custom");
    expect(container.textContent?.toLowerCase()).toContain("internal");
  });
});
