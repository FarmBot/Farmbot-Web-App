import {
  calcMicrostepsPerMm, calculateAxialLengths
} from "../direction_axes_props";
import { fakeFirmwareConfig } from "../../../__test_support__/fake_state/resources";

describe("calcMicrostepsPerMm()", () => {
  it("uses fallback values", () => {
    expect(calcMicrostepsPerMm(undefined, undefined)).toEqual(1);
  });

  it("calculates value with no microstepping", () => {
    expect(calcMicrostepsPerMm(5, 1)).toEqual(5);
  });

  it("calculates value with microstepping", () => {
    expect(calcMicrostepsPerMm(5, 4)).toEqual(20);
  });
});

describe("calculateAxialLengths()", () => {
  it("calculates lengths", () => {
    const firmwareSettings = fakeFirmwareConfig().body;
    firmwareSettings.movement_axis_nr_steps_x = 0;
    firmwareSettings.movement_step_per_mm_x = 0;
    firmwareSettings.movement_microsteps_x = 0;
    firmwareSettings.movement_axis_nr_steps_y = 100;
    firmwareSettings.movement_step_per_mm_y = 5;
    firmwareSettings.movement_microsteps_y = 1;
    firmwareSettings.movement_axis_nr_steps_z = 100;
    firmwareSettings.movement_step_per_mm_z = 25;
    firmwareSettings.movement_microsteps_z = 4;
    expect(calculateAxialLengths({ firmwareSettings })).toEqual({
      x: 0, y: 20, z: 1
    });
  });
});
