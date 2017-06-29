
import { regimensReducer } from "../reducer";

const STATE = {
  "dailyOffsetMs": 300000,
  "selectedSequenceUUID": "sequences.71.167",
  "weeks": [
    {
      "days": {
        "day1": true,
        "day2": true,
        "day3": true,
        "day4": true,
        "day5": true,
        "day6": true,
        "day7": true
      }
    }
  ]
}

describe("Regimens reducer", () => {
  it("initializes", () => {
    const ACTION = { type: "TOGGLE_DAY", payload: { week: 0, day: 4 } };
    let nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks[0].days["day4"]).toBeFalsy();
  })
})
