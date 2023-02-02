import { fakeState } from "../../__test_support__/fake_state";
import { overwrite, refreshStart, refreshOK, refreshNO } from "../../api/crud";
import {
  SpecialStatus,
  TaggedSequence,
  TaggedDevice,
  ResourceName,
  TaggedResource,
  TaggedTool,
  TaggedPlantPointer,
} from "farmbot";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { GeneralizedError } from "../actions";
import { Actions } from "../../constants";
import { fakeResource } from "../../__test_support__/fake_resource";
import { resourceReducer } from "../reducer";
import { findByUuid } from "../reducer_support";
import { EditResourceParams } from "../../api/interfaces";
import {
  fakeCurve,
  fakeFolder, fakePlant, fakeSequence,
} from "../../__test_support__/fake_state/resources";
import { PlantPointer } from "farmbot/dist/resources/api_resources";

describe("resource reducer", () => {
  it("marks resources as DIRTY when reducing OVERWRITE_RESOURCE", () => {
    const state = fakeState().resources;
    const uuid = Object.keys(state.index.byKind.Sequence)[0];
    const sequence = state.index.references[uuid] as TaggedSequence;
    expect(sequence).toBeTruthy();

    expect(sequence.kind).toBe("Sequence");
    const sequenceBodyUpdate = fakeSequence().body;
    sequenceBodyUpdate.forked = false;
    const next = resourceReducer(state, overwrite(sequence, sequenceBodyUpdate));
    const seq2 = next.index.references[uuid] as TaggedSequence;
    expect(seq2.specialStatus).toBe(SpecialStatus.DIRTY);
    expect(seq2.body.forked).toBeFalsy();
  });

  it("updates fork status when reducing OVERWRITE_RESOURCE", () => {
    const state = fakeState().resources;
    const uuid = Object.keys(state.index.byKind.Sequence)[0];
    const sequence = state.index.references[uuid] as TaggedSequence;
    expect(sequence).toBeTruthy();

    expect(sequence.kind).toBe("Sequence");
    sequence.body.sequence_version_id = 1;
    const sequenceBodyUpdate = fakeSequence().body;
    sequenceBodyUpdate.forked = false;
    const next = resourceReducer(state, overwrite(sequence, sequenceBodyUpdate));
    const seq2 = next.index.references[uuid] as TaggedSequence;
    expect(seq2.specialStatus).toBe(SpecialStatus.DIRTY);
    expect(seq2.body.forked).toEqual(true);
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

  it("sets a value as undefined while editing a resource", () => {
    const waterCurve = fakeCurve();
    waterCurve.body.id = 1;
    const plant = fakePlant();
    plant.body.water_curve_id = waterCurve.body.id;
    const startingState = buildResourceIndex([waterCurve, plant]);
    const { index } = startingState;
    const { uuid } = plant;
    const update: Partial<PlantPointer> = { water_curve_id: undefined };
    const payload: EditResourceParams = {
      uuid,
      update,
      specialStatus: SpecialStatus.SAVED
    };
    const action = { type: Actions.EDIT_RESOURCE, payload };
    const newState = resourceReducer(startingState, action);
    const oldPlant = index.references[uuid] as TaggedPlantPointer;
    const newPlant = newState.index.references[uuid] as TaggedPlantPointer;
    expect(oldPlant.body.water_curve_id).toEqual(1);
    expect(newPlant.body.water_curve_id).toEqual(undefined);
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

  it("handles unknown resource kinds", () => {
    const startingState = fakeState().resources;
    const uuid = Object.keys(startingState.index.byKind.Tool)[0];
    const action = {
      type: Actions.INIT_RESOURCE,
      payload: {
        uuid, kind: "Unknown",
        body: { id: 0 }, SpecialStatus: SpecialStatus.DIRTY
      }
    };
    console.error = jest.fn();
    resourceReducer(startingState, action);
    expect(console.error).toHaveBeenCalledWith(
      "Unknown is not an indexed resource.");
  });

  it("adds point to curve usage lookup", () => {
    const otherCurve = fakeCurve();
    otherCurve.body.id = 1;
    const waterCurve = fakeCurve();
    waterCurve.body.id = 2;
    const spreadCurve = fakeCurve();
    spreadCurve.body.id = 3;
    const heightCurve = fakeCurve();
    heightCurve.body.id = 4;
    const plant = fakePlant();
    plant.body.water_curve_id = waterCurve.body.id;
    plant.body.spread_curve_id = spreadCurve.body.id;
    plant.body.height_curve_id = heightCurve.body.id;
    const startingState = buildResourceIndex([
      otherCurve, waterCurve, spreadCurve, heightCurve,
    ]);
    const action = { type: Actions.INIT_RESOURCE, payload: plant };
    const newState = resourceReducer(startingState, action);
    expect(newState.index.inUse["Curve.Point"][waterCurve.uuid]).toBeTruthy();
    expect(newState.index.inUse["Curve.Point"][spreadCurve.uuid]).toBeTruthy();
    expect(newState.index.inUse["Curve.Point"][heightCurve.uuid]).toBeTruthy();
    expect(newState.index.inUse["Curve.Point"][otherCurve.uuid]).toBeFalsy();
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
    (startingState.index.sequenceFolders.localMetaAttributes[1].open as unknown)
      = undefined;
    const action = { type: Actions.FOLDER_TOGGLE, payload: { id: 1 } };
    const newState = resourceReducer(startingState, action);
    expect(newState.index.sequenceFolders.localMetaAttributes[1].open)
      .toEqual(true);
  });
});

describe("findByUuid", () => {
  it("crashes on bad UUIDs", () => {
    expect(() => findByUuid(buildResourceIndex().index, "Nope!")).toThrow();
  });
});
