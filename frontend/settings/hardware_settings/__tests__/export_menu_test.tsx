jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  FwParamExportMenu, condenseFwConfig, uncondenseFwConfig, importParameters,
  resendParameters,
} from "../export_menu";
import {
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import { error } from "../../../toast/toast";
import { fakeState } from "../../../__test_support__/fake_state";
import { edit, save } from "../../../api/crud";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

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

describe("importParameters()", () => {
  it("errors", () => {
    importParameters("")(jest.fn(), fakeState);
    expect(error).toHaveBeenCalledWith("Hardware parameter import error.");
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("doesn't import settings", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    importParameters("{}")(jest.fn(), () => state);
    expect(error).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("imports settings", () => {
    const state = fakeState();
    const config = fakeFirmwareConfig();
    config.body.id = 1;
    state.resources = buildResourceIndex([config]);
    importParameters("{\"encoder_enabled\":{\"x\":1}}")(jest.fn(), () => state);
    expect(error).not.toHaveBeenCalled();
    expect(edit).toHaveBeenCalledWith(config, { encoder_enabled_x: 1 });
    expect(save).toHaveBeenCalledWith(config.uuid);
  });
});

describe("resendParameters()", () => {
  it("resends", () => {
    const state = fakeState();
    const config = fakeFirmwareConfig();
    config.body.param_version = 1;
    state.resources = buildResourceIndex([config]);
    resendParameters()(jest.fn(), () => state);
    config.body.param_version = 2;
    expect(edit).toHaveBeenCalledWith(config, config.body);
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("rolls", () => {
    const state = fakeState();
    const config = fakeFirmwareConfig();
    config.body.param_version = 101;
    state.resources = buildResourceIndex([config]);
    resendParameters()(jest.fn(), () => state);
    config.body.param_version = 1;
    expect(edit).toHaveBeenCalledWith(config, config.body);
    expect(save).toHaveBeenCalledWith(config.uuid);
  });

  it("handles missing firmware config", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    resendParameters()(jest.fn(), () => state);
    expect(edit).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
});
