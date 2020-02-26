import * as React from "react";
import { mount, shallow } from "enzyme";
import { HardwareSettings } from "../hardware_settings";
import { HardwareSettingsProps } from "../../interfaces";
import { Actions } from "../../../constants";
import { bot } from "../../../__test_support__/fake_state/bot";
import { panelState } from "../../../__test_support__/control_panel_state";
import {
  fakeFirmwareConfig
} from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import type { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { Color } from "../../../ui";

describe("<HardwareSettings />", () => {
  const fakeProps = (): HardwareSettingsProps => ({
    bot,
    controlPanelState: panelState(),
    botToMqttStatus: "up",
    dispatch: jest.fn(),
    sourceFwConfig: x =>
      ({ value: fakeFirmwareConfig().body[x], consistent: true }),
    firmwareConfig: undefined,
    shouldDisplay: jest.fn(),
    firmwareHardware: undefined,
    resources: buildResourceIndex().index,
  });

  it("renders", () => {
    const wrapper = mount(<HardwareSettings {...fakeProps()} />);
    ["expand all", "x axis", "motors"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  function checkDispatch(
    buttonElement: string,
    buttonIndex: number,
    buttonText: string,
    type: string,
    payload: boolean | string) {
    const p = fakeProps();
    const wrapper = mount(<HardwareSettings {...p} />);
    clickButton(wrapper, buttonIndex, buttonText, {
      button_tag: buttonElement, partial_match: true
    });
    expect(p.dispatch).toHaveBeenCalledWith({ payload, type });
  }

  it("expands all", () => {
    checkDispatch("button", 0, "expand all",
      Actions.BULK_TOGGLE_CONTROL_PANEL, true);
  });

  it("collapses all", () => {
    checkDispatch("button", 1, "collapse all",
      Actions.BULK_TOGGLE_CONTROL_PANEL, false);
  });

  it("toggles motor category", () => {
    checkDispatch("h4", 1, "motors",
      Actions.TOGGLE_CONTROL_PANEL_OPTION, "motors");
  });

  it("shows param export menu", () => {
    const p = fakeProps();
    p.firmwareConfig = fakeFirmwareConfig().body;
    const wrapper = shallow(<HardwareSettings {...p} />);
    expect(wrapper.html()).toContain("fa-download");
  });

  it("shows setting load progress", () => {
    type ConsistencyLookup = Record<keyof FirmwareConfig, boolean>;
    const consistent: Partial<ConsistencyLookup> =
      ({ id: false, encoder_invert_x: true, encoder_enabled_y: false });
    const consistencyLookup = consistent as ConsistencyLookup;
    const p = fakeProps();
    const fakeConfig: Partial<FirmwareConfig> =
      ({ id: 0, encoder_invert_x: 1, encoder_enabled_y: 0 });
    p.firmwareConfig = fakeConfig as FirmwareConfig;
    p.sourceFwConfig = x =>
      ({ value: p.firmwareConfig?.[x], consistent: consistencyLookup[x] });
    const wrapper = mount(<HardwareSettings {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.background).toEqual(Color.white);
    expect(barStyle?.width).toEqual("50%");
  });

  it("shows setting load progress: 0%", () => {
    const p = fakeProps();
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.sourceFwConfig = () => ({ value: 0, consistent: false });
    const wrapper = mount(<HardwareSettings {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.width).toEqual("0%");
    expect(barStyle?.background).toEqual(Color.darkGray);
  });

  it("shows setting load progress: 100%", () => {
    const p = fakeProps();
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.sourceFwConfig = () => ({ value: 0, consistent: true });
    const wrapper = mount(<HardwareSettings {...p} />);
    const barStyle = wrapper.find(".load-progress-bar").props().style;
    expect(barStyle?.width).toEqual("100%");
    expect(barStyle?.background).toEqual(Color.darkGray);
  });
});
