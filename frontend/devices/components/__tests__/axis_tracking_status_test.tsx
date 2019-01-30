import { axisTrackingStatus } from "../axis_tracking_status";
import { bot } from "../../../__test_support__/fake_state/bot";

const expected =
  [
    {
      "axis": "x",
      "disabled": false
    },
    {
      "axis": "y",
      "disabled": false
    },
    {
      "axis": "z",
      "disabled": true
    }
  ];

describe("axisTrackingStatus()", () => {
  it("returns axis status", () => {
    const result = axisTrackingStatus(bot.hardware.mcu_params);
    expect(result).toEqual(expected);
  });
});
