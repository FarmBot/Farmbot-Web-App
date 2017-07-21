
import { regimensReducer } from "../reducer";
import { Actions } from "../../constants";

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
        "day7": false
      }
    }
  ]
};

describe("Regimens reducer", () => {
  it("initializes", () => {
    const ACTION = { type: Actions.TOGGLE_DAY, payload: { week: 0, day: 4 } };
    let nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks[0].days["day4"]).toBeFalsy();
  });
});

describe("selectDays()", () => {
  it("selects all days", () => {
    const ACTION = { type: Actions.SELECT_ALL_DAYS, payload: undefined };
    let nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks[0].days["day7"]).toBeTruthy();
  });
});

describe("deselectDays()", () => {
  it("deselects all days", () => {
    const ACTION = { type: Actions.DESELECT_ALL_DAYS, payload: undefined };
    let nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks[0].days["day6"]).toBeFalsy();
  });
});

describe("pushWeek()", () => {
  it("add a week", () => {
    const ACTION = { type: Actions.PUSH_WEEK, payload: undefined };
    let nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks.length).toEqual(2);
  });
});

describe("popWeek()", () => {
  it("remove a week", () => {
    const ACTION = { type: Actions.POP_WEEK, payload: undefined };
    let nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks.length).toEqual(0);
  });
});
