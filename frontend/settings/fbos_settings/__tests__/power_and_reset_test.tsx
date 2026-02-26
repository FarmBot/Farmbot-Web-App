const mockDevice = { rebootFirmware: jest.fn(() => Promise.resolve()) };

import React from "react";
import { PowerAndReset } from "../power_and_reset";
import { PowerAndResetProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { fakeState } from "../../../__test_support__/fake_state";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { clickButton } from "../../../__test_support__/helpers";
import * as device from "../../../device";
import { renderWithContext } from "../../../__test_support__/mount_with_context";

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  mockDevice.rebootFirmware.mockClear();
  jest.spyOn(device, "getDevice")
    .mockImplementation(() => mockDevice as never);
});


describe("<PowerAndReset/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): PowerAndResetProps => ({
    settingsPanelState: settingsPanelState(),
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    botOnline: true,
    showAdvanced: true,
  });

  it("renders in open state", () => {
    const p = fakeProps();
    p.settingsPanelState.power_and_reset = true;
    const wrapper = renderWithContext(<PowerAndReset {...p} />);
    const text = (wrapper.container.textContent || "").toLowerCase();
    ["Power and Reset", "Restart", "Shutdown"]
      .map(string => expect(text)
        .toContain(string.toLowerCase()));
  });

  it("renders as closed", () => {
    const p = fakeProps();
    p.settingsPanelState.power_and_reset = false;
    const wrapper = renderWithContext(<PowerAndReset {...p} />);
    const text = (wrapper.container.textContent || "").toLowerCase();
    expect(text)
      .toContain("Power and Reset".toLowerCase());
    expect(text)
      .not.toContain("Soft Reset".toLowerCase());
  });

  it("restarts firmware", () => {
    const p = fakeProps();
    p.settingsPanelState.power_and_reset = true;
    const wrapper = renderWithContext(<PowerAndReset {...p} />);
    expect((wrapper.container.textContent || "").toLowerCase())
      .toContain("Restart Firmware".toLowerCase());
    clickButton(wrapper, 0, "restart");
    expect(mockDevice.rebootFirmware).toHaveBeenCalled();
  });
});
