jest.mock("i18next", () => ({ t: (i: string) => i }));

import { commitBulkEditor, setTimeOffset, toggleDay, setSequence } from "../actions";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { TaggedResource } from "farmbot";
import { Actions } from "../../../constants";
import { Everything } from "../../../interfaces";
import { ToggleDayParams } from "../interfaces";
import { error, warning } from "farmbot-toastr";
import { newTaggedResource } from "../../../sync/actions";
import { arrayUnwrap } from "../../../resources/util";

describe("commitBulkEditor()", () => {
  function newFakeState() {
    const state = fakeState();
    const fakeResources: TaggedResource[] = [
      arrayUnwrap(newTaggedResource("Regimen", {
        "id": 1,
        "name": "Test Regimen",
        "color": "gray",
        "regimen_items": [
          {
            "id": 1,
            "regimen_id": 1,
            "sequence_id": 1,
            "time_offset": 1000
          }
        ]
      })),
      arrayUnwrap(newTaggedResource("Sequence", {
        "id": 1,
        "name": "Test Sequence",
        "color": "gray",
        "body": [{ kind: "wait", args: { milliseconds: 100 } }],
        "args": {
          "locals": { kind: "scope_declaration", args: {} },
          "version": 4
        },
        "kind": "sequence"
      }))
    ];
    state.resources.index = buildResourceIndex(fakeResources).index;
    const all = Object.keys(state.resources.index.all);
    const regimenUuid = all[0];
    const sequenceUuid = all[1];

    state.resources.consumers.regimens.currentRegimen = regimenUuid;
    state.resources.consumers.regimens.selectedSequenceUUID = sequenceUuid;
    state.resources.consumers.regimens.dailyOffsetMs = 2000;
    state.resources.consumers.regimens.weeks = [{
      days:
      {
        day1: true,
        day2: false,
        day3: false,
        day4: false,
        day5: false,
        day6: false,
        day7: false
      }
    }];
    return state;
  }

  function returnsError(state: Everything, message: string, title?: string) {
    const getState = () => state;
    const dispatch = jest.fn();
    commitBulkEditor()(dispatch, getState);
    expect(dispatch).not.toHaveBeenCalled();
    if (title) {
      expect(error).toBeCalledWith(message, title);
    } else {
      expect(error).toBeCalledWith(message);
    }
  }

  it("does nothing if no regimen is selected", () => {
    const state = newFakeState();
    state.resources.consumers.regimens.currentRegimen = undefined;
    returnsError(state, "Select a regimen first or create one.");
  });

  it("does nothing if no sequence is selected", () => {
    const state = newFakeState();
    state.resources.consumers.regimens.selectedSequenceUUID = undefined;
    returnsError(state,
      "Select a sequence from the dropdown first.",
      "Error");
  });

  it("does nothing if no days are selected", () => {
    const state = newFakeState();
    state.resources.consumers.regimens.weeks[0].days.day1 = false;
    returnsError(state, "No day(s) selected.");
  });

  it("does nothing if no weeks", () => {
    const state = newFakeState();
    state.resources.consumers.regimens.weeks = [];
    returnsError(state, "No day(s) selected.");
  });

  it("adds items", () => {
    const state = newFakeState();
    const getState = () => state;
    const dispatch = jest.fn();
    commitBulkEditor()(dispatch, getState);
    expect(dispatch).toHaveBeenCalledWith({
      payload: expect.objectContaining({
        update: expect.objectContaining({
          regimen_items: [
            { id: 1, regimen_id: 1, sequence_id: 1, time_offset: 1000 },
            { sequence_id: 1, time_offset: 2000 }]
        }),
      }),
      type: Actions.OVERWRITE_RESOURCE
    });
    expect(error).not.toHaveBeenCalled();
  });
});

describe("setTimeOffset()", () => {
  it("returns action", () => {
    const action = setTimeOffset(100);
    expect(action).toEqual({ payload: 100, type: Actions.SET_TIME_OFFSET });
  });

  it("throws error for NaN", () => {
    expect(() => setTimeOffset(NaN))
      .toThrowError("Bad time input on regimen page: null");
    expect(warning).toBeCalledWith(
      "Time is not properly formatted.", "Bad Input");
  });
});

describe("toggleDay()", () => {
  it("returns action", () => {
    const params: ToggleDayParams = { week: 0, day: 0 };
    const action = toggleDay(params);
    expect(action).toEqual({
      payload: { day: 0, week: 0 },
      type: Actions.TOGGLE_DAY
    });
  });
});

describe("setSequence()", () => {
  it("returns action", () => {
    const action = setSequence("Sequence");
    expect(action).toEqual({
      payload: "Sequence",
      type: Actions.SET_SEQUENCE
    });
  });
});
