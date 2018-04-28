jest.mock("farmbot-toastr", () => ({ error: jest.fn() }));

import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";

describe("mapStateToProps()", () => {
  it("hovered plantUUID is undefined", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.hoveredPlant = {
      plantUUID: "x", icon: ""
    };
    expect(mapStateToProps(state).hoveredPlant).toBeFalsy();
  });

  it("peripherals pins have correct states", () => {
    const state = fakeState();
    function checkValue(input: number, value: boolean) {
      state.bot.hardware.pins = { 13: { value: input, mode: 0 } };
      const peripheralPin = mapStateToProps(state).peripherals[0];
      expect(peripheralPin.value).toEqual(value);
    }
    checkValue(0, false);
    checkValue(-1, false);
    checkValue(1, true);
    checkValue(2, true);
  });

  it("stepsPerMm is defined", () => {
    const state = fakeState();
    state.bot.hardware.mcu_params.movement_step_per_mm_x = 3;
    state.bot.hardware.mcu_params.movement_step_per_mm_y = 4;
    expect(mapStateToProps(state).stepsPerMmXY).toEqual({ x: 3, y: 4 });
  });
});
