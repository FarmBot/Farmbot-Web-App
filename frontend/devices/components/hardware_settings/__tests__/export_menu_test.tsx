import * as React from "react";
import { mount } from "enzyme";
import {
  FwParamExportMenu, condenseFwConfig, uncondenseFwConfig
} from "../export_menu";
import {
  fakeFirmwareConfig
} from "../../../../__test_support__/fake_state/resources";

describe("<FwParamExportMenu />", () => {
  it("lists all params", () => {
    const config = fakeFirmwareConfig().body;
    const wrapper = mount(<FwParamExportMenu firmwareConfig={config} />);
    expect(wrapper.text()).toContain(
      "\"encoder_enabled\": {\"x\": 0, \"y\": 0, \"z\": 0 },");
    expect(wrapper.text()).toContain(
      "\"pin_guard_1\": {\"active_state\": 1, " +
      "\"pin_nr\": 0, \"time_out\": 60 },");
    expect(wrapper.text()).toContain(
      "\"param_mov_nr_retry\": {\"\": 3 },");
  });
});

describe("condenseFwConfig()", () => {
  it("condenses config", () => {
    const config = fakeFirmwareConfig().body;
    expect(condenseFwConfig(config)).toEqual(expect.objectContaining({
      encoder_enabled: { x: 0, y: 0, z: 0 }
    }));
    expect(condenseFwConfig(config)).toEqual(expect.objectContaining({
      pin_guard_1: { active_state: 1, pin_nr: 0, time_out: 60 }
    }));
    expect(condenseFwConfig(config)).toEqual(expect.objectContaining({
      param_mov_nr_retry: { "": 3 }
    }));
  });

  it("is reversible", () => {
    const config = fakeFirmwareConfig().body;
    const result = uncondenseFwConfig(condenseFwConfig(config));
    expect(result).toEqual(config);
  });
});
