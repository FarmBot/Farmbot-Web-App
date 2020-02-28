import {
  buildResourceIndex,
  FAKE_RESOURCES,
} from "../__test_support__/resource_index_builder";
import { TaggedFarmEvent, SpecialStatus } from "farmbot";

const STUB_RESOURCE: TaggedFarmEvent = {
  "uuid": "FarmEvent.0.435",
  "kind": "FarmEvent",
  "specialStatus": SpecialStatus.SAVED,
  "body": {
    "id": 217,
    "start_time": "2017-07-21T00:30:00.000Z",
    "end_time": "2017-07-21T00:31:00.000Z",
    "repeat": 1,
    "time_unit": "never",
    "executable_id": 78,
    "executable_type": "Regimen"
  }
};

test("buildResourceIndex - base case", () => {
  const result1 = buildResourceIndex(FAKE_RESOURCES);
  const { index } = result1;
  const OK_LENGTH = FAKE_RESOURCES.length;
  expect(Object.keys(index.all).length).toBe(OK_LENGTH);
  expect(Object.keys(index.references).length).toBe(OK_LENGTH);
});

test("buildResourceIndex - add a FarmEvent", () => {
  const db = buildResourceIndex([STUB_RESOURCE]);
  const key = Object.keys(db.index.byKind.FarmEvent)[0];
  const fe = db.index.references[key];
  expect(fe).toBeTruthy();
  if (fe?.kind === "FarmEvent") {
    const { body } = fe;
    expect(body).toEqual(STUB_RESOURCE.body);
  } else {
    fail("fe was falsy or not a farm event.");
  }
});
