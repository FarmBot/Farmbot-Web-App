import {
  decodeBinary,
  routeMqttData,
  asTaggedResource,
  handleCreate,
  handleUpdate,
  handleCreateOrUpdate
} from "../auto_sync";
import { SpecialStatus, TaggedSequence } from "farmbot";
import { Actions } from "../../constants";
import { fakeState } from "../../__test_support__/fake_state";
import { GetState } from "../../redux/interfaces";
import { SyncPayload, UpdateMqttData, Reason } from "../interfaces";
import { storeUUID } from "../data_consistency";
import { unpackUUID } from "../../util";

function toBinary(input: object): Buffer {
  return Buffer.from(JSON.stringify(input), "utf8");
}

const fakePayload: SyncPayload = {
  args: { label: "label1" },
  body: { foo: "bar" }
};

const payload = (): UpdateMqttData<TaggedSequence> => ({
  status: "UPDATE",
  kind: "Sequence",
  id: 5,
  body: {} as TaggedSequence["body"],
  sessionId: "wow"
});

describe("handleCreateOrUpdate", () => {
  it("creates new records if it doesn't have one locally", () => {
    const myPayload = payload();
    const dispatch = jest.fn();
    const getState = jest.fn(fakeState);
    const result = handleCreateOrUpdate(dispatch, getState, myPayload);
    expect(result).toBe(undefined);
    expect(dispatch).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.INIT_RESOURCE
    }));
  });

  it("ignores local echo", () => {
    jest.resetAllMocks();
    const myPayload = payload();
    const dispatch = jest.fn();
    const getState = jest.fn(fakeState) as GetState;
    const fakeUuid = "x";
    myPayload.sessionId = fakeUuid;
    storeUUID(fakeUuid);

    const result = handleCreateOrUpdate(dispatch, getState, myPayload);
    expect(result).toBe(true);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("updates existing records when found locally", () => {
    const myPayload = payload();
    const dispatch = jest.fn();
    const getState = jest.fn(fakeState) as GetState;
    const { index } = getState().resources;

    const fakeId =
      unpackUUID(Object.values(index.byKind.Sequence)[0]).remoteId || -1;
    myPayload.id = fakeId;
    myPayload.kind = "Sequence";
    handleCreateOrUpdate(dispatch, getState, myPayload);
    expect(dispatch).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.OVERWRITE_RESOURCE
    }));
  });
});

describe("handleUpdate", () => {
  it("creates Redux actions when data updates", () => {
    const wow = handleUpdate(payload());
    expect(wow.type).toEqual(Actions.OVERWRITE_RESOURCE);
  });
});

describe("handleCreate", () => {
  it("creates appropriate Redux actions", () => {
    const wow = handleCreate(payload());
    expect(wow.type).toEqual(Actions.INIT_RESOURCE);
  });
});

describe("asTaggedResource", () => {
  it("turns MQTT data into FE data", () => {
    const UUID = "123-456-789";
    const p = payload();
    const result = asTaggedResource(p);
    expect(result.body).toEqual(p.body);
    expect(result.kind).toEqual(p.kind);
    expect(result.specialStatus).toEqual(SpecialStatus.SAVED);
    expect(result.uuid).toEqual(UUID);
  });
});

describe("decodeBinary()", () => {
  it("transforms binary back to JSON", () => {
    const results = decodeBinary(toBinary(fakePayload));

    expect(results.args).toBeInstanceOf(Object);
    expect(results.args.label).toEqual("label1");
    expect(results.body).toBeInstanceOf(Object);
  });
});

describe("routeMqttData", () => {
  it("tosses out irrelevant data", () => {
    const results = routeMqttData("smething/else", toBinary({}));
    expect(results.status).toEqual("SKIP");
  });

  it("tosses out data missing an ID", () => {
    const results = routeMqttData("bot/device_9/sync", toBinary({}));
    expect(results.status).toEqual("ERR");
    results.status === "ERR" && expect(results.reason).toEqual(Reason.BAD_CHAN);
  });

  it("handles well formed deletion data", () => {
    const results = routeMqttData("bot/device_9/sync/Sequence/1", toBinary({}));
    expect(results.status).toEqual("DELETE");
    if (results.status !== "DELETE") {
      fail();
      return;
    }
    expect(results.id).toEqual(1);
    expect(results.kind).toEqual("Sequence");
  });

  it("handles well formed update data", () => {
    const fake1 = {
      args: {
        label: "hey"
      },
      body: {
        foo: "bar"
      }
    };
    const payl = toBinary(fake1);
    const results = routeMqttData("bot/device_9/sync/Sequence/1", payl);
    expect(results.status).toEqual("UPDATE");
    if (results.status !== "UPDATE") {
      fail();
      return;
    }

    expect(results.id).toEqual(1);
    expect(results.kind).toEqual("Sequence");
    expect(results.body).toEqual(fake1.body);
  });
});
