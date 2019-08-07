import { generateReducer } from "../redux/generate_reducer";
import { RestResources } from "./interfaces";
import {
  indexUpsert,
  mutateSpecialStatus,
  findByUuid,
  indexRemove,
  initResourceReducer,
  afterEach,
  beforeEach
} from "./reducer_support";
import { TaggedResource, SpecialStatus } from "farmbot";
import { Actions } from "../constants";
import { EditResourceParams } from "../api/interfaces";
import { defensiveClone, equals } from "../util";
import { merge } from "lodash";
import { SyncBodyContents } from "../sync/actions";
import { GeneralizedError } from "./actions";
import { initialState as helpState } from "../help/reducer";
import { initialState as designerState } from "../farm_designer/reducer";
import { farmwareState } from "../farmware/reducer";
import { initialState as regimenState } from "../regimens/reducer";
import { initialState as sequenceState } from "../sequences/reducer";
import { initialState as alertState } from "../messages/reducer";

export const emptyState = (): RestResources => {
  return {
    consumers: {
      sequences: sequenceState,
      regimens: regimenState,
      farm_designer: designerState,
      farmware: farmwareState,
      help: helpState,
      alerts: alertState
    },
    loaded: [],
    index: {
      all: {},
      byKind: {
        Alert: {},
        Crop: {},
        Device: {},
        DiagnosticDump: {},
        FarmEvent: {},
        FarmwareEnv: {},
        FarmwareInstallation: {},
        FbosConfig: {},
        FirmwareConfig: {},
        Image: {},
        Log: {},
        Peripheral: {},
        PinBinding: {},
        Plant: {},
        PlantTemplate: {},
        Point: {},
        PointGroup: {},
        Regimen: {},
        SavedGarden: {},
        Sensor: {},
        SensorReading: {},
        Sequence: {},
        Tool: {},
        User: {},
        WebAppConfig: {},
        WebcamFeed: {},
      },
      byKindAndId: {},
      references: {},
      sequenceMetas: {},
      inUse: {
        "Regimen.FarmEvent": {},
        "Sequence.FarmEvent": {},
        "Sequence.Regimen": {},
        "Sequence.Sequence": {},
      }
    }
  };
};

/** Responsible for all RESTful resources. */
export let resourceReducer =
  generateReducer<RestResources>(emptyState())
    .beforeEach(beforeEach)
    .afterEach(afterEach)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
      indexUpsert(s.index, [payload], "ongoing");
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVED);
      return s;
    })
    .add<EditResourceParams>(Actions.EDIT_RESOURCE, (s, { payload }) => {
      const { update } = payload;
      const target = findByUuid(s.index, payload.uuid);
      const before = defensiveClone(target.body);
      merge(target, { body: update });
      const didChange = !equals(before, target.body);
      if (didChange) {
        mutateSpecialStatus(target.uuid, s.index, SpecialStatus.DIRTY);
        indexUpsert(s.index, [target], "ongoing");
      }
      return s;
    })
    .add<EditResourceParams>(Actions.OVERWRITE_RESOURCE, (s, { payload }) => {
      const { uuid, update, specialStatus } = payload;
      const original = findByUuid(s.index, uuid);
      original.body = update;
      indexUpsert(s.index, [original], "ongoing");
      mutateSpecialStatus(uuid, s.index, specialStatus);
      return s;
    })
    .add<SyncBodyContents<TaggedResource>>(Actions.RESOURCE_READY, (s, { payload }) => {
      !s.loaded.includes(payload.kind) && s.loaded.push(payload.kind);
      indexUpsert(s.index, payload.body, "initial");
      return s;
    })
    .add<TaggedResource>(Actions.REFRESH_RESOURCE_OK, (s, { payload }) => {
      indexUpsert(s.index, [payload], "ongoing");
      mutateSpecialStatus(payload.uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
      indexRemove(s.index, payload);
      return s;
    })
    .add<GeneralizedError>(Actions._RESOURCE_NO, (s, { payload }) => {
      merge(findByUuid(s.index, payload.uuid), payload);
      mutateSpecialStatus(payload.uuid, s.index, payload.statusBeforeError);
      return s;
    })
    .add<TaggedResource>(Actions.INIT_RESOURCE, initResourceReducer)
    .add<string>(Actions.REFRESH_RESOURCE_START, (s, a) => {
      mutateSpecialStatus(a.payload, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<GeneralizedError>(Actions.REFRESH_RESOURCE_NO, (s, { payload }) => {
      mutateSpecialStatus(payload.uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.SAVE_RESOURCE_START, (s, { payload }) => {
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<TaggedResource[]>(Actions.BATCH_INIT, (s, { payload }) => {
      return payload.reduce((state, resource) => {
        return initResourceReducer(state, {
          type: Actions.INIT_RESOURCE,
          payload: resource
        });
      }, s);
    });
