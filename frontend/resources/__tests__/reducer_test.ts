import { fakeState } from "../../__test_support__/fake_state";
import { overwrite, refreshStart, refreshOK, refreshNO } from "../../api/crud";
import {
  SpecialStatus,
  TaggedSequence,
  TaggedDevice,
  ResourceName,
  TaggedResource,
  TaggedTool,
} from "farmbot";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { GeneralizedError } from "../actions";
import { Actions } from "../../constants";
import { fakeResource } from "../../__test_support__/fake_resource";
import { resourceReducer } from "../reducer";
import { findByUuid } from "../reducer_support";
import { EditResourceParams } from "../../api/interfaces";
import { fakeFolder } from "../../__test_support__/fake_state/resources";

describe("resource reducer", () => {
  it("marks resources as DIRTY when reducing OVERWRITE_RESOURCE", () => {
    const state = fakeState().resources;
    const uuid = Object.keys(state.index.byKind.Sequence)[0];
    const sequence = state.index.references[uuid] as TaggedSequence;
    expect(sequence).toBeTruthy();

    expect(sequence.kind).toBe("Sequence");
    const next = resourceReducer(state, overwrite(sequence, {
      kind: "sequence",
      name: "wow",
      folder_id: undefined,
      args: { version: -0, locals: { kind: "scope_declaration", args: {} } },
      body: [],
      color: "red"
    }));
    const seq2 = next.index.references[uuid] as TaggedSequence;
    expect(seq2.specialStatus).toBe(SpecialStatus.DIRTY);
  });

  it("marks resources as SAVING when reducing REFRESH_RESOURCE_START", () => {
    const state = fakeState().resources;
    const uuid = Object.keys(state.index.byKind.Device)[0];
    const device = state.index.references[uuid] as TaggedDevice;
    expect(device).toBeTruthy();

    expect(device.kind).toBe("Device");
    const afterStart = resourceReducer(state, refreshStart(device.uuid));
    const dev2 = afterStart.index.references[uuid] as TaggedDevice;
    expect(dev2.specialStatus).toBe(SpecialStatus.SAVING);

    // SCENARIO: REFRESH_START ===> REFRESH_OK
    const afterOk = resourceReducer(afterStart, refreshOK(device));
    const dev3 = afterOk.index.references[uuid] as TaggedDevice;
    expect(dev3.specialStatus).toBe(SpecialStatus.SAVED);
    const payl: GeneralizedError = {
      err: "X",
      uuid: dev3.uuid,
      statusBeforeError: SpecialStatus.DIRTY
    };
    // SCENARIO: REFRESH_START ===> REFRESH_NO
    const afterNo =
      resourceReducer(afterStart, refreshNO(payl));
    const dev4 = afterNo.index.references[uuid] as TaggedDevice;
    expect(dev4.specialStatus).toBe(SpecialStatus.SAVED);
  });

  const TEST_RESOURCE_NAMES: TaggedResource["kind"][] = ["Crop", "Device",
    "FarmEvent", "FarmwareInstallation", "FbosConfig",
    "FirmwareConfig", "Log", "Peripheral", "PinBinding", "PlantTemplate",
    "Point", "Regimen", "SavedGarden", "Sensor"];

  it("EDITs a _RESOURCE", () => {
    const startingState = fakeState().resources;
    const { index } = startingState;
    const uuid = Object.keys(index.byKind.Tool)[0];
    const update: Partial<TaggedTool["body"]> = { name: "after" };
    const payload: EditResourceParams = {
      uuid,
      update,
      specialStatus: SpecialStatus.SAVED
    };
    const action = { type: Actions.EDIT_RESOURCE, payload };
    const newState = resourceReducer(startingState, action);
    const oldTool = index.references[uuid] as TaggedTool;
    const newTool = newState.index.references[uuid] as TaggedTool;
    expect(oldTool.body.name).not.toEqual("after");
    expect(newTool.body.name).toEqual("after");
  });

  it("handles resource failures", () => {
    const startingState = fakeState().resources;
    const uuid = Object.keys(startingState.index.byKind.Tool)[0];
    const action = {
      type: Actions._RESOURCE_NO,
      payload: { uuid, err: "Whatever", statusBeforeError: SpecialStatus.DIRTY }
    };
    const newState = resourceReducer(startingState, action);
    const tool = newState.index.references[uuid] as TaggedTool;
    expect(tool.specialStatus).toBe(SpecialStatus.DIRTY);
  });

  it("covers destroy resource branches", () => {
    const testResourceDestroy = (kind: ResourceName) => {

      const state = fakeState().resources;
      const resource = fakeResource(kind as TaggedResource["kind"], {});
      const action = {
        type: Actions.DESTROY_RESOURCE_OK,
        payload: resource
      };
      const newState = resourceReducer(state, action);
      expect(newState.index.references[resource.uuid]).toEqual(undefined);
    };
    TEST_RESOURCE_NAMES
      .concat(["Image", "SensorReading"])
      .map((kind: ResourceName) => testResourceDestroy(kind));
  });

  it("toggles folder open state", () => {
    const folder = fakeFolder();
    folder.body.id = 1;
    const startingState = buildResourceIndex([folder]);
    delete startingState.index.sequenceFolders.localMetaAttributes[1].open;
    const action = { type: Actions.FOLDER_TOGGLE, payload: { id: 1 } };
    const newState = resourceReducer(startingState, action);
    expect(newState.index.sequenceFolders.localMetaAttributes[1].open)
      .toEqual(false);
  });
});

describe("findByUuid", () => {
  it("crashes on bad UUIDs", () => {
    expect(() => findByUuid(buildResourceIndex().index, "Nope!")).toThrow();
  });
});
