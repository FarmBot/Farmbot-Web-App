const actions = require("../../config_storage/actions");
actions.toggleWebAppBool = jest.fn();

import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerControls as DesignerControls,
  DesignerControlsProps,
  mapStateToProps,
} from "../../controls/controls";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeWebAppConfig, fakeFbosConfig, fakeSequence,
} from "../../__test_support__/fake_state/resources";
import { toggleWebAppBool } from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";

describe("<DesignerControls />", () => {
  const fakeProps = (): DesignerControlsProps => ({
    dispatch: jest.fn(),
    bot: bot,
    feeds: [],
    peripherals: [],
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: false,
    firmwareSettings: bot.hardware.mcu_params,
    getWebAppConfigVal: jest.fn(),
    env: {},
    firmwareHardware: undefined,
    shouldDisplay: () => true,
  });

  it("renders controls", () => {
    const wrapper = mount(<DesignerControls {...fakeProps()} />);
    ["move", "peripherals", "webcam"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.text().toLowerCase()).not.toContain("pinned");
  });

  it("shows plot", () => {
    const p = fakeProps();
    p.getWebAppConfigVal = () => true;
    const wrapper = mount(<DesignerControls {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("seconds ago");
  });

  it("shows pinned sequences", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.pinned = true;
    p.sequences = [sequence];
    const wrapper = mount(<DesignerControls {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("pinned");
  });

  it("hides webcam feeds", () => {
    const p = fakeProps();
    p.getWebAppConfigVal = () => true;
    const wrapper = mount(<DesignerControls {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("webcam");
  });

  it("toggles value", () => {
    const wrapper = mount<DesignerControls>(
      <DesignerControls {...fakeProps()} />);
    wrapper.instance().toggle(BooleanSetting.show_pins)();
    expect(toggleWebAppBool).toHaveBeenCalledWith(BooleanSetting.show_pins);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const config = fakeWebAppConfig();
    config.body.busy_log = 1;
    state.resources = buildResourceIndex([config]);
    const props = mapStateToProps(state);
    expect(props.firmwareSettings).toEqual({
      encoder_enabled_x: 1,
      encoder_enabled_y: 1,
      encoder_enabled_z: 0,
    });
    expect(props.getWebAppConfigVal("busy_log")).toEqual(1);
    expect(props.firmwareHardware).toEqual(undefined);
  });

  it("returns valid firmware value", () => {
    const state = fakeState();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    state.resources = buildResourceIndex([config]);
    expect(mapStateToProps(state).firmwareHardware).toEqual("arduino");
  });
});
