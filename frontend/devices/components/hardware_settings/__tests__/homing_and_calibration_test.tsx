jest.mock("../../../actions", () => ({ updateMCU: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { HomingAndCalibration } from "../homing_and_calibration";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { updateMCU } from "../../../actions";
import {
  fakeFirmwareConfig
} from "../../../../__test_support__/fake_state/resources";
import { error, warning } from "../../../../toast/toast";
import { inputEvent } from "../../../../__test_support__/fake_html_events";

describe("<HomingAndCalibration />", () => {
  function testAxisLengthInput(
    provided: string, expected: string | undefined) {
    const dispatch = jest.fn();
    bot.controlPanelState.homing_and_calibration = true;
    const result = mount(<HomingAndCalibration
      dispatch={dispatch}
      bot={bot}
      firmwareConfig={fakeFirmwareConfig().body}
      sourceFwConfig={x => ({
        value: bot.hardware.mcu_params[x], consistent: true
      })}
      botDisconnected={false} />);
    const e = inputEvent(provided);
    const input = result.find("input").first().props();
    input.onChange && input.onChange(e);
    input.onSubmit && input.onSubmit(e);
    expected
      ? expect(updateMCU)
        .toHaveBeenCalledWith("movement_axis_nr_steps_x", expected)
      : expect(updateMCU).not.toHaveBeenCalled();
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
});
