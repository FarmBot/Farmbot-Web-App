import React from "react";
import { mount } from "enzyme";
import { RawDesignerControls as DesignerControls } from "../../controls/controls";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeWebAppConfig, fakeFbosConfig, fakeSequence,
} from "../../__test_support__/fake_state/resources";
import { DesignerControlsProps } from "../interfaces";
import { mapStateToProps } from "../state_to_props";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

describe("<DesignerControls />", () => {
  const fakeProps = (): DesignerControlsProps => ({
    dispatch: jest.fn(),
    bot: bot,
    feeds: [],
    peripherals: [],
    sequences: [],
    resources: buildResourceIndex([]).index,
    menuOpen: undefined,
    firmwareSettings: bot.hardware.mcu_params,
    getConfigValue: jest.fn(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    env: {},
    firmwareHardware: undefined,
    movementState: fakeMovementState(),
    pinBindings: [],
    logs: [],
  });

  it("renders controls", () => {
    const wrapper = mount(<DesignerControls {...fakeProps()} />);
    ["move", "peripherals", "webcam"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
    expect(wrapper.text().toLowerCase()).not.toContain("pinned");
  });

  it("shows plot", () => {
    const p = fakeProps();
    p.getConfigValue = () => true;
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
    p.getConfigValue = () => true;
    const wrapper = mount(<DesignerControls {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("webcam");
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
    expect(props.getConfigValue("busy_log")).toEqual(1);
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
