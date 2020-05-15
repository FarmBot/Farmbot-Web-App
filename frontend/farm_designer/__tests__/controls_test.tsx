import * as React from "react";
import { mount } from "enzyme";
import {
  RawDesignerControls as DesignerControls,
  DesignerControlsProps,
  mapStateToProps,
} from "../controls";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeWebAppConfig, fakeFbosConfig,
} from "../../__test_support__/fake_state/resources";

describe("<DesignerControls />", () => {
  const fakeProps = (): DesignerControlsProps => ({
    dispatch: jest.fn(),
    bot: bot,
    feeds: [],
    peripherals: [],
    firmwareSettings: bot.hardware.mcu_params,
    getWebAppConfigVal: jest.fn(),
    env: {},
    firmwareHardware: undefined,
  });

  it("renders controls", () => {
    const wrapper = mount(<DesignerControls {...fakeProps()} />);
    ["move", "peripherals", "webcam"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("shows plot", () => {
    const p = fakeProps();
    p.getWebAppConfigVal = () => true;
    const wrapper = mount(<DesignerControls {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("seconds ago");
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
