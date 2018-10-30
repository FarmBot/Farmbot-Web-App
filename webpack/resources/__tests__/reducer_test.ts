import { findByUuid, joinKindAndId } from "../reducer_support";
import { fakeState } from "../../__test_support__/fake_state";
import { overwrite, refreshStart, refreshOK, refreshNO } from "../../api/crud";
import { SpecialStatus, TaggedSequence, TaggedDevice, ResourceName, TaggedResource } from "farmbot";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { GeneralizedError } from "../actions";
import { Actions } from "../../constants";
import { fakeResource } from "../../__test_support__/fake_resource";
import { resourceReducer } from "../reducer";
import { resourceReady } from "../../sync/actions";

describe("resource reducer", () => {
  it("marks resources as DIRTY when reducing OVERWRITE_RESOURCE", () => {
    const state = fakeState().resources;
    const uuid = state.index.byKind.Sequence[0];
    const sequence = state.index.references[uuid] as TaggedSequence;
    expect(sequence).toBeTruthy();

    expect(sequence.kind).toBe("Sequence");
    const next = resourceReducer(state, overwrite(sequence, {
      name: "wow",
      args: { locals: { kind: "scope_declaration", args: {} } },
      body: []
    }));
    const seq2 = next.index.references[uuid] as TaggedSequence;
    expect(seq2.specialStatus).toBe(SpecialStatus.DIRTY);
  });

  it("marks resources as SAVING when reducing REFRESH_RESOURCE_START", () => {
    const state = fakeState().resources;
    const uuid = state.index.byKind.Device[0];
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
    "DiagnosticDump", "FarmEvent", "FarmwareInstallation", "FbosConfig",
    "FirmwareConfig", "Log", "Peripheral", "PinBinding", "PlantTemplate",
    "Point", "Regimen", "SavedGarden", "Sensor", "Sequence"];
  let id = 1;
  it("covers save resource branches", () => {
    const testResource = (kind: TaggedResource["kind"]) => {
      const resource = fakeResource(kind, { id: ++id }) as TaggedResource;
      const action = resourceReady(resource.kind, [resource]);
      const newState = resourceReducer(fakeState().resources, action);
      const uuid = newState.index.byKindAndId[joinKindAndId(kind, resource.body.id)];
      const expectation = newState.index.references[uuid || "?"];

      expect(expectation).toEqual(resource);
    };
    TEST_RESOURCE_NAMES.map(kind => testResource(kind));
  });

  it("covers destroy resource branches", () => {
    const testResourceDestroy = (kind: ResourceName) => {

      const state = fakeState().resources;
      const resource = fakeResource(kind, {});
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
});

describe("findByUuid", () => {
  it("crashes on bad UUIDs", () => {
    expect(() => findByUuid(buildResourceIndex().index, "Nope!")).toThrow();
  });
});
