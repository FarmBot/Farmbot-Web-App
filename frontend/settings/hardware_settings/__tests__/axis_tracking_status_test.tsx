import {
  axisTrackingStatus, disabledAxisMap, enabledAxisMap,
} from "../axis_tracking_status";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("axisTrackingStatus()", () => {
  it("returns axis status", () => {
    const result = axisTrackingStatus(bot.hardware.mcu_params);
    expect(result).toEqual([
      { axis: "x", disabled: false },
      { axis: "y", disabled: false },
      { axis: "z", disabled: true },
    ]);
  });

  it("overrides encoder enable", () => {
    bot.hardware.mcu_params.encoder_enabled_x = 1;
    bot.hardware.mcu_params.encoder_enabled_y = 0;
    bot.hardware.mcu_params.encoder_enabled_z = 1;
    bot.hardware.mcu_params.movement_enable_endpoints_x = 1;
    bot.hardware.mcu_params.movement_enable_endpoints_y = 0;
    bot.hardware.mcu_params.movement_enable_endpoints_z = 0;
    const disabledAxes = axisTrackingStatus(bot.hardware.mcu_params, true);
    expect(disabledAxes).toEqual([
      { axis: "x", disabled: false },
      { axis: "y", disabled: true },
      { axis: "z", disabled: true },
    ]);
  });
});

describe("enabled/disabled axis feedback maps", () => {
  const mcuParams = {
    encoder_enabled_x: 1,
    encoder_enabled_y: 0,
    encoder_enabled_z: 0,
    movement_enable_endpoints_x: 0,
    movement_enable_endpoints_y: 0,
    movement_enable_endpoints_z: 1,
  };

  it("returns axes with feedback enabled", () => {
    const enabledAxes = enabledAxisMap(mcuParams);
    expect(enabledAxes).toEqual({ x: true, y: false, z: true });
  });

  it("returns axes with feedback disabled", () => {
    const disabledAxes = disabledAxisMap(mcuParams);
    expect(disabledAxes).toEqual({ x: false, y: true, z: false });
  });
});
