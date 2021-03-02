const mockDevice = {
  updateMCU: jest.fn(() => Promise.resolve()),
  calibrate: jest.fn(() => Promise.resolve()),
  findHome: jest.fn(() => Promise.resolve()),
  setZero: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { AxisSettings } from "../axis_settings";
import { bot } from "../../../__test_support__/fake_state/bot";
import {
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import { error, warning } from "../../../toast/toast";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { panelState } from "../../../__test_support__/control_panel_state";
import { AxisSettingsProps } from "../interfaces";
import { CalibrationRow } from "../calibration_row";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit } from "../../../api/crud";

describe("<AxisSettings />", () => {
  const state = fakeState();
  state.resources = buildResourceIndex([fakeFirmwareConfig()]);

  const fakeProps = (): AxisSettingsProps => ({
    dispatch: mockDispatch(jest.fn(), () => state),
    bot,
    controlPanelState: panelState(),
    sourceFwConfig: x => ({
      value: bot.hardware.mcu_params[x], consistent: true
    }),
    sourceFbosConfig: x => ({
      value: bot.hardware.configuration[x], consistent: true
    }),
    firmwareConfig: fakeFirmwareConfig().body,
    botOnline: true,
    firmwareHardware: undefined,
    showAdvanced: true,
  });

  function testAxisLengthInput(
    provided: string, expected: string | undefined) {
    const p = fakeProps();
    p.bot.controlPanelState.axis_settings = true;
    const result = mount(<AxisSettings {...p} />);
    const e = inputEvent(provided);
    const input = result.find("input").first().props();
    input.onChange && input.onChange(e);
    input.onSubmit && input.onSubmit(e);
    expected
      ? expect(edit)
        .toHaveBeenCalledWith(expect.any(Object), {
          movement_axis_nr_steps_x: expected,
        })
      : expect(edit).not.toHaveBeenCalled();
  }

  it("long int: too long", () => {
    testAxisLengthInput("10000000000", undefined);
    expect(error)
      .toHaveBeenCalledWith("Value must be less than or equal to 2000000000.");
  });

  it("long int: ok", () => {
    testAxisLengthInput("100000", "100000");
    expect(warning).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("finds home", () => {
    const wrapper = shallow(<AxisSettings {...fakeProps()} />);
    wrapper.find(CalibrationRow).first().props().action("x");
    expect(mockDevice.findHome).toHaveBeenCalledWith({
      axis: "x", speed: 100
    });
  });

  it("calibrates", () => {
    const wrapper = shallow(<AxisSettings {...fakeProps()} />);
    wrapper.find(CalibrationRow).last().props().action("all");
    expect(mockDevice.calibrate).toHaveBeenCalledWith({ axis: "all" });
  });

  it("doesn't disable calibration: different firmware", () => {
    const p = fakeProps();
    p.firmwareHardware = "arduino";
    const wrapper = shallow(<AxisSettings {...p} />);
    expect(wrapper.find(CalibrationRow).last().props().stallUseDisabled)
      .toBeFalsy();
  });

  it("doesn't disable calibration: not disabled", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = shallow(<AxisSettings {...p} />);
    expect(wrapper.find(CalibrationRow).last().props().stallUseDisabled)
      .toBeFalsy();
  });

  it("sets zero", () => {
    const wrapper = shallow(<AxisSettings {...fakeProps()} />);
    wrapper.find(CalibrationRow).at(1).props().action("all");
    expect(mockDevice.setZero).toHaveBeenCalledWith("all");
  });

  it("shows express board related labels", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    p.controlPanelState.axis_settings = true;
    const wrapper = shallow(<AxisSettings {...p} />);
    expect(wrapper.find(CalibrationRow).first().props().toolTip)
      .toContain("stall detection");
  });

  it("shows z height inputs", () => {
    const p = fakeProps();
    p.controlPanelState.axis_settings = true;
    const wrapper = mount(<AxisSettings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("safe height");
    expect(wrapper.text().toLowerCase()).toContain("soil height");
  });
});
