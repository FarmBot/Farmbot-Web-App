jest.mock("../../redux/store", () => ({ store: jest.fn() }));

import { botReducer, initialState } from "../reducer";
import { Actions } from "../../constants";
import { BotState } from "../interfaces";
import { defensiveClone } from "../../util";
import { stash } from "../../connectivity/data_consistency";
import { uuid } from "farmbot";
import { now } from "../connectivity/qos";

const statusOf = (state: BotState) => {
  return state.hardware.informational_settings.sync_status;
};

describe("botReducer", () => {
  it("Starts / stops an update", () => {
    const step1 = botReducer(initialState(), {
      type: Actions.SETTING_UPDATE_START,
      payload: undefined
    });
    expect(step1.isUpdating).toBe(true);

    const step2 = botReducer(step1, {
      type: Actions.SETTING_UPDATE_END,
      payload: undefined
    });

    expect(step2.isUpdating).toBe(false);
  });

  it("changes step size", () => {
    const state = botReducer(initialState(), {
      type: Actions.CHANGE_STEP_SIZE,
      payload: 23
    });
    expect(state.stepSize).toBe(23);
  });

  it("fetches OS update info", () => {
    const r = botReducer(initialState(), {
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: "1.2.3" }
    }).osUpdateVersion;
    expect(r).toBe("1.2.3");
  });

  it("fetches min OS feature data", () => {
    const r = botReducer(initialState(), {
      type: Actions.FETCH_MIN_OS_FEATURE_INFO_OK,
      payload: {}
    }).minOsFeatureData;
    expect(r).toEqual({});
  });

  it("fetches OS release notes", () => {
    const r = botReducer(initialState(), {
      type: Actions.FETCH_OS_RELEASE_NOTES_OK,
      payload: "notes"
    }).osReleaseNotes;
    expect(r).toEqual("notes");
  });

  it("handles status update", () => {
    const state = initialState();
    state.hardware.informational_settings.sync_status = "synced";
    const action = { type: Actions.STATUS_UPDATE, payload: state.hardware };
    const r = botReducer(state, action);
    expect(r.hardware.informational_settings.sync_status).toEqual("synced");
  });

  it("resets hardware state when transitioning into maintenance mode.", () => {
    const state = initialState();
    const payload = defensiveClone(state.hardware);
    payload.informational_settings.sync_status = "maintenance";
    payload.location_data.position.x = -1;
    payload.location_data.position.y = -1;
    payload.location_data.position.z = -1;
    const action = { type: Actions.STATUS_UPDATE, payload };
    // Make the starting state different than initialState();
    const result = botReducer(state, action);
    // Resets .hardware to initialState()
    expect(result.hardware.location_data.position)
      .toEqual(initialState().hardware.location_data.position);
    expect(result.hardware.informational_settings.sync_status)
      .toBe("maintenance");
  });

  it("stashes/unstashes sync status based on connectivity", () => {
    const step1 = initialState();
    step1.statusStash = "booting";
    step1.hardware.informational_settings.sync_status = "synced";

    const go = (direction: "up" | "down", one: BotState) => {
      const id = uuid();
      const action1 = { type: Actions.PING_START, payload: { id } };
      const two = botReducer(one, action1);
      const type_ = (direction == "up") ? Actions.PING_OK : Actions.PING_NO;
      const action2 = { type: type_, payload: { id, at: now() } };

      return botReducer(two, action2);
    };

    const step2 = go("down", step1);
    expect(step2.statusStash).toBe(statusOf(step1));
    expect(statusOf(step2)).toBeUndefined();

    const step3 = go("down", step2);
    expect(step3.statusStash).toBe(statusOf(step1));
    expect(statusOf(step3)).toBeUndefined();

    const step4 = go("up", step3);
    expect(statusOf(step4)).toBe(step3.statusStash);
  });

  it("doesn't stash sync status", () => {
    const state = initialState();
    state.hardware.informational_settings.sync_status = "synced";
    state.connectivity.pings = {
      "a": { kind: "pending", start: 50 },
      "b": { kind: "complete", start: 100, end: 200 },
    };
    const action = { type: Actions.PING_NO, payload: { id: "a" } };
    const nextState = botReducer(state, action);
    expect(nextState.hardware.informational_settings.sync_status)
      .toEqual("synced");
  });

  it("clears pings", () => {
    const state = initialState();
    state.connectivity.pings = {
      "a": { kind: "pending", start: 50 },
      "b": { kind: "complete", start: 100, end: 200 },
    };
    const action = { type: Actions.CLEAR_PINGS, payload: undefined };
    const nextState = botReducer(state, action);
    expect(nextState.connectivity.pings).toEqual({});
  });

  it("handles STASH_STATUS / _RESOURCE_NO", () => {
    const step1 = initialState();
    step1.statusStash = "booting";
    step1.hardware.informational_settings.sync_status = "synced";
    const step2 = botReducer(step1, stash());
    expect(step2.statusStash).toBe(statusOf(step1));
    const no = { type: Actions._RESOURCE_NO, payload: undefined };
    const step3 = botReducer(step2, no);
    expect(statusOf(step3)).toBe(step3.statusStash);
  });

  it("sets needs version check flag", () => {
    const state = initialState();
    state.needVersionCheck = true;
    const action = { type: Actions.SET_NEEDS_VERSION_CHECK, payload: false };
    const r = botReducer(state, action);
    expect(r.needVersionCheck).toEqual(false);
  });

  it("sets sent malformed message notification flag", () => {
    const state = initialState();
    state.alreadyToldUserAboutMalformedMsg = true;
    const action = {
      type: Actions.SET_MALFORMED_NOTIFICATION_SENT, payload: false,
    };
    const r = botReducer(state, action);
    expect(r.alreadyToldUserAboutMalformedMsg).toEqual(false);
  });
});
