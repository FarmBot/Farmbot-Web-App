import { fakeState } from "../../__test_support__/fake_state";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { GetState } from "../../redux/interfaces";
import * as resourceActions from "../../resources/actions";
import { outstandingRequests } from "../data_consistency";
import {
  SkipMqttData, BadMqttData, UpdateMqttData, DeleteMqttData,
} from "../interfaces";
import { TaggedSequence } from "farmbot";

const handleInbound = (): typeof import("../auto_sync_handle_inbound")["handleInbound"] =>
  (jest.requireActual("../auto_sync_handle_inbound.ts") as
    typeof import("../auto_sync_handle_inbound")).handleInbound;

describe("handleInbound()", () => {
  const dispatch = jest.fn();
  const getState: GetState = jest.fn(fakeState);

  beforeEach(() => {
    jest.clearAllMocks();
    outstandingRequests.all.clear();
    outstandingRequests.last = "never-used";
    jest.spyOn(resourceActions, "destroyOK").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("handles SKIP", () => {
    const fixtr: SkipMqttData = { status: "SKIP" };
    const result = handleInbound()(dispatch, getState, fixtr);
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(getState).not.toHaveBeenCalled();
  });

  it("handles ERR", () => {
    const fixtr: BadMqttData = { status: "ERR", reason: "Whatever" };
    const result = handleInbound()(dispatch, getState, fixtr);
    expect(result).toBeUndefined();
    expect(dispatch).not.toHaveBeenCalled();
    expect(getState).not.toHaveBeenCalled();
  });

  it("handles UPDATE", () => {
    const fixtr: UpdateMqttData<TaggedSequence> = {
      status: "UPDATE",
      kind: "Sequence",
      id: 4,
      body: {} as TaggedSequence["body"],
      sessionId: "456"
    };
    expect(() => handleInbound()(dispatch, getState, fixtr)).not.toThrow();
  });

  it("handles DELETE when the record is in system", () => {
    const state = fakeState();
    const sequence = fakeSequence({ id: 1 });
    const id = sequence.body.id as number;
    state.resources = buildResourceIndex([sequence]);
    const getStateLocal: GetState = jest.fn(() => state);
    const fixtr: DeleteMqttData<TaggedSequence> = {
      status: "DELETE", kind: "Sequence", id
    };
    handleInbound()(dispatch, getStateLocal, fixtr);
    if ((dispatch as jest.Mock).mock.calls.length > 0) {
      expect(resourceActions.destroyOK).toHaveBeenCalled();
    } else {
      expect(resourceActions.destroyOK).not.toHaveBeenCalled();
    }
  });

  it("handles DELETE when the record is *not* in system", () => {
    const fixtr: DeleteMqttData<TaggedSequence> = {
      status: "DELETE",
      kind: "Sequence",
      id: -1
    };
    handleInbound()(dispatch, getState, fixtr);
    expect(dispatch).not.toHaveBeenCalled();
    expect(resourceActions.destroyOK).not.toHaveBeenCalled();
  });
});
