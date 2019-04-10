
import { regimensReducer, RegimenState } from "../reducer";
import { Actions } from "../../constants";
import { popWeek, pushWeek, selectDays, deselectDays } from "../bulk_scheduler/actions";
import { defensiveClone } from "../../util";

const STATE: RegimenState = {
  dailyOffsetMs: 300000,
  selectedSequenceUUID: "Sequence.71.167",
  currentRegimen: "Regimen.4.56",
  weeks: [
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
  ],
  schedulerOpen: false,
};

describe("Regimens reducer", () => {
  it("initializes", () => {
    const ACTION = { type: Actions.TOGGLE_DAY, payload: { week: 0, day: 4 } };
    const nextState = regimensReducer(STATE, ACTION);
    expect(nextState.weeks[0].days["day4"]).toBeFalsy();
  });
});

describe("selectDays()", () => {
  it("selects all days", () => {
    const nextState = regimensReducer(STATE, selectDays());
    expect(nextState.weeks[0].days["day7"]).toBeTruthy();
  });
});

describe("deselectDays()", () => {
  it("deselects all days", () => {
    const nextState = regimensReducer(STATE, deselectDays());
    expect(nextState.weeks[0].days["day6"]).toBeFalsy();
  });
});

describe("pushWeek()", () => {
  it("add a week", () => {
    const nextState = regimensReducer(STATE, pushWeek());
    expect(nextState.weeks.length).toEqual(2);
  });
});

describe("popWeek()", () => {
  it("removes a week", () => {
    const nextState = regimensReducer(STATE, popWeek());
    expect(nextState.weeks.length).toEqual(0);
  });
});

describe("DESTROY_RESOURCE_OK", () => {
  it("resets selectedSequenceUUID", () => {
    const uuid = STATE.selectedSequenceUUID;
    if (uuid) {
      const action = { type: Actions.DESTROY_RESOURCE_OK, payload: { uuid } };
      const nextState = regimensReducer(STATE, action);
      expect(nextState.selectedSequenceUUID).toBe(undefined);
    } else {
      fail();
    }
  });
});

describe("INIT_RESOURCE", () => {
  it("sets currentRegimen", () => {
    const state = defensiveClone(STATE);
    state.currentRegimen = undefined;
    const action = {
      type: Actions.INIT_RESOURCE,
      payload: { uuid: "Regimen.4.56", kind: "Regimen" }
    };
    const nextState = regimensReducer(STATE, action);
    expect(nextState.currentRegimen).toBe(action.payload.uuid);
  });
});

describe("SELECT_REGIMEN", () => {
  it("sets currentRegimen", () => {
    const state = defensiveClone(STATE);
    state.currentRegimen = undefined;
    const action = {
      type: Actions.SELECT_REGIMEN,
      payload: "Regimen.4.56"
    };
    const nextState = regimensReducer(STATE, action);
    expect(nextState.currentRegimen).toBe(action.payload);
  });
});

describe("SET_SEQUENCE", () => {
  it("sets selectedSequenceUUID", () => {
    const state = defensiveClone(STATE);
    state.selectedSequenceUUID = undefined;
    const action = {
      type: Actions.SET_SEQUENCE,
      payload: "sequence"
    };
    const nextState = regimensReducer(STATE, action);
    expect(nextState.selectedSequenceUUID).toBe(action.payload);
  });
});

describe("SET_TIME_OFFSET", () => {
  it("sets dailyOffsetMs", () => {
    const state = defensiveClone(STATE);
    state.dailyOffsetMs = NaN;
    const action = {
      type: Actions.SET_TIME_OFFSET,
      payload: 100
    };
    const nextState = regimensReducer(STATE, action);
    expect(nextState.dailyOffsetMs).toBe(action.payload);
  });
});

describe("SET_SCHEDULER_STATE", () => {
  it("sets schedulerOpen", () => {
    const state = defensiveClone(STATE);
    state.schedulerOpen = false;
    const action = {
      type: Actions.SET_SCHEDULER_STATE,
      payload: true
    };
    const nextState = regimensReducer(STATE, action);
    expect(nextState.schedulerOpen).toBe(action.payload);
  });
});
