jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockShouldDisplay = false;
jest.mock("../../../farmware/state_to_props", () => ({
  shouldDisplayFeature: () => mockShouldDisplay,
}));

import React from "react";
import { mount } from "enzyme";
import { ErrorHandling } from "../error_handling";
import { ErrorHandlingProps } from "../interfaces";
import { panelState } from "../../../__test_support__/control_panel_state";
import { bot } from "../../../__test_support__/fake_state/bot";
import { edit, save } from "../../../api/crud";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<ErrorHandling />", () => {
  const fakeConfig = fakeFirmwareConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);
  const fakeProps = (): ErrorHandlingProps => ({
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    controlPanelState: panelState(),
    sourceFwConfig: x =>
      ({ value: bot.hardware.mcu_params[x], consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    showAdvanced: false,
  });

  it("shows error handling labels", () => {
    const p = fakeProps();
    const wrapper = mount(<ErrorHandling {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("error handling");
  });

  it("toggles retries e-stop parameter", () => {
    const p = fakeProps();
    p.controlPanelState.error_handling = true;
    p.sourceFwConfig = () => ({ value: 1, consistent: true });
    const wrapper = mount(<ErrorHandling {...p} />);
    wrapper.find("button").at(0).simulate("click");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { param_e_stop_on_mov_err: 0 });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("shows new parameters", () => {
    mockShouldDisplay = true;
    const p = fakeProps();
    p.controlPanelState.error_handling = true;
    const wrapper = mount(<ErrorHandling {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("total");
  });
});
