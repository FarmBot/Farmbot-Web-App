jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import {
  commitBulkEditor, setTimeOffset, toggleDay, setSequence,
} from "../actions";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { TaggedResource, Coordinate } from "farmbot";
import { Actions, Content } from "../../../constants";
import { Everything } from "../../../interfaces";
import { ToggleDayParams } from "../interfaces";
import { newTaggedResource } from "../../../sync/actions";
import { arrayUnwrap } from "../../../resources/util";
import { overwrite } from "../../../api/crud";
import { fakeVariableNameSet } from "../../../__test_support__/fake_variables";
import { error, warning } from "../../../toast/toast";
import { newWeek } from "../../reducer";
import {
  fakeRegimen, fakeSequence,
} from "../../../__test_support__/fake_state/resources";

const sequence_id = 23;
const regimen_id = 32;
describe("commitBulkEditor()", () => {
  function newFakeState() {
    const state = fakeState();
    const regBody = fakeRegimen().body;
    regBody.id = regimen_id;
    regBody.name = "Test Regimen";
    regBody.regimen_items = [
      { regimen_id, sequence_id, time_offset: 1000 },
    ];
    const reg = newTaggedResource("Regimen", regBody)[0];
    const seqBody = fakeSequence().body;
    seqBody.id = sequence_id;
    seqBody.name = "Test Sequence";
    seqBody.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    const seq = arrayUnwrap(newTaggedResource("Sequence", seqBody));
    const regimenUuid = reg.uuid;
    const sequenceUuid = seq.uuid;
    const fakeResources: TaggedResource[] = [reg, seq, fakeDevice()];
    state.resources.index = buildResourceIndex(fakeResources).index;

    state.resources.consumers.regimens.currentRegimen = regimenUuid;
    state.resources.consumers.regimens.selectedSequenceUUID = sequenceUuid;
    state.resources.consumers.regimens.dailyOffsetMs = 2000;
    const week = newWeek();
    week.days.day1 = true;
    state.resources.consumers.regimens.weeks = [week];
    return state;
  }

  function returnsError(state: Everything, message: string, title?: string) {
    const getState = () => state;
    const dispatch = jest.fn();
    commitBulkEditor()(dispatch, getState);
    expect(dispatch).not.toHaveBeenCalled();
    if (title) {
      expect(error).toHaveBeenCalledWith(message, title);
    } else {
      expect(error).toHaveBeenCalledWith(message);
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
      "Select a sequence from the dropdown first.");
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
    console.log = jest.fn();
    const state = newFakeState();
    const getState = () => state;
    const dispatch = jest.fn();
    commitBulkEditor()(dispatch, getState);
    const expected = [
      { regimen_id, sequence_id, time_offset: 1000 },
      { sequence_id, time_offset: 2000 },
    ];
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        regimen_items: expect.arrayContaining(expected)
      }));
    expect(error).not.toHaveBeenCalled();
  });

  it("provides warning", () => {
    console.log = jest.fn();
    const state = newFakeState();
    state.resources.consumers.regimens.dailyOffsetMs = 10800000;
    const getState = () => state;
    const dispatch = jest.fn();
    commitBulkEditor()(dispatch, getState);
    const expected = [
      { regimen_id, sequence_id, time_offset: 1000 },
      { sequence_id, time_offset: 10800000 },
    ];
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        regimen_items: expect.arrayContaining(expected)
      }));
    expect(error).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith(Content.WITHIN_HOUR_OF_OS_UPDATE);
  });

  it("merges variables", () => {
    console.log = jest.fn();
    const state = newFakeState();
    const seqUUID = state.resources.consumers.regimens.selectedSequenceUUID;
    const label = "variable_label";
    const varData = fakeVariableNameSet(label);
    const variable = varData[label];
    const COORDINATE: Coordinate =
      ({ kind: "coordinate", args: { x: 0, y: 0, z: 0 } });
    variable && (variable.celeryNode = {
      kind: "parameter_declaration",
      args: { label, default_value: COORDINATE }
    });
    state.resources.index.sequenceMetas[seqUUID || ""] = varData;
    const dispatch = jest.fn();
    commitBulkEditor()(dispatch, () => state);
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        body: [{
          kind: "variable_declaration",
          args: { label, data_value: COORDINATE }
        }]
      }));
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
      .toThrow("Bad time input on regimen page: null");
    expect(warning).toHaveBeenCalledWith(
      "Time is not properly formatted.", { title: "Bad Input" });
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

  it("handles empty uuid", () => {
    const action = setSequence("");
    expect(action).toEqual({
      payload: "",
      type: Actions.SET_SEQUENCE
    });
  });
});
