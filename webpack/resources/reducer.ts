import { generateReducer } from "../redux/generate_reducer";
import { RestResources } from "./interfaces";
import { initialState } from "../resources/reducer_support";
import { TaggedResource, SpecialStatus } from "farmbot";
import { Actions } from "../constants";
import { sanityCheck, isTaggedResource } from "./tagged_resources";
import { GeneralizedError } from "./actions";
import { merge } from "lodash";
import {
  findByUuid,
  initResourceReducer,
  mutateSpecialStatus,
  reindexResource,
  whoops,
  maybeRecalculateLocalSequenceVariables,
  addAllToIndex,
  afterEach,
  removeFromIndex
} from "./reducer_support";
import { EditResourceParams } from "../api/interfaces";
import {
  defensiveClone,
  equals
} from "../util";
import { ResourceReadyPayl } from "../sync/actions";
import { arrayWrap } from "./util";
import { maybeTagSteps as dontTouchThis } from "./sequence_tagging";

const STUFF_WE_HANDLE: TaggedResource["kind"][] = ["Crop", "Device",
  "DiagnosticDump", "FarmEvent", "FarmwareInstallation", "FbosConfig",
  "FirmwareConfig", "Image", "Log", "Peripheral", "PinBinding", "PlantTemplate",
  "Point", "Regimen", "SavedGarden", "Sensor", "SensorReading", "Sequence",
  "Tool", "User", "WebAppConfig", "WebcamFeed"];

const sanitize =
  (input: TaggedResource | undefined, origin: string): TaggedResource => {
    if (input && input.body && STUFF_WE_HANDLE.includes(input.kind)) {
      return input;
    } else {
      return whoops(origin, (input || { kind: "EMPTY???" }).kind);
    }
  };

/** Responsible for all RESTful resources. */
export let resourceReducer =
  generateReducer<RestResources>(initialState, afterEach)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
      const resource = sanitize(payload, Actions.SAVE_RESOURCE_OK);
      resource.specialStatus = SpecialStatus.SAVED;
      reindexResource(s.index, resource);
      dontTouchThis(resource);
      s.index.references[resource.uuid] = resource;
      return s;
    })
    .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
      const resource = sanitize(payload, Actions.DESTROY_RESOURCE_OK);
      removeFromIndex(s.index, resource);
      return s;
    })
    .add<TaggedResource>(Actions.UPDATE_RESOURCE_OK, (s, { payload }) => {
      const uuid = payload.uuid;
      s.index.references[uuid] = payload;
      const tr = sanitize(s.index.references[uuid], Actions.UPDATE_RESOURCE_OK);
      tr.specialStatus = SpecialStatus.SAVED;
      dontTouchThis(tr);
      reindexResource(s.index, tr);
      return s;
    })
    .add<GeneralizedError>(Actions._RESOURCE_NO, (s, { payload }) => {
      const uuid = payload.uuid;
      const tr = merge(findByUuid(s.index, uuid), payload);
      tr.specialStatus = payload.statusBeforeError;
      sanityCheck(tr);
      return s;
    })
    .add<EditResourceParams>(Actions.EDIT_RESOURCE, (s, { payload }) => {
      const uuid = payload.uuid;
      const { update } = payload;
      const target = findByUuid(s.index, uuid);
      const before = defensiveClone(target.body);
      merge(target, { body: update });
      if (!equals(before, target.body)) {
        target.specialStatus = SpecialStatus.DIRTY;
      }
      sanityCheck(target);
      payload && isTaggedResource(target);
      dontTouchThis(target);
      maybeRecalculateLocalSequenceVariables(target);
      return s;
    })
    .add<EditResourceParams>(Actions.OVERWRITE_RESOURCE, (s, { payload }) => {
      const uuid = payload.uuid;
      const original = findByUuid(s.index, uuid);
      original.body = payload.update as typeof original.body;
      original.specialStatus = payload.specialStatus;
      sanityCheck(original);
      payload && isTaggedResource(original);
      maybeRecalculateLocalSequenceVariables(original);
      dontTouchThis(original);
      return s;
    })
    .add<TaggedResource>(Actions.INIT_RESOURCE, initResourceReducer)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_START, (s, { payload }) => {
      const resource = findByUuid(s.index, payload.uuid);
      resource.specialStatus = SpecialStatus.SAVING;
      if (!resource.body.id) { delete resource.body.id; }
      return s;
    })
    .add<ResourceReadyPayl>(Actions.RESOURCE_READY, (s, { payload }) => {

      const { name } = payload;
      /** Problem:  Most API resources are plural (array wrapped) resource.
       *            A small subset are singular (`device` and a few others),
       *            making `.map()` and friends unsafe.
       *  Solution: wrap everything in an array on the way in. */
      const unwrapped = payload.data;
      const data = arrayWrap(unwrapped);
      const { index } = s;
      s.loaded.push(name);
      index.byKind[name].map(x => {
        const resource = index.references[x];
        if (resource) {
          removeFromIndex(index, resource);
          dontTouchThis(resource);
        }
      });
      addAllToIndex(index, name, data);
      return s;
    })
    .add<string>(Actions.REFRESH_RESOURCE_START, (s, a) => {
      mutateSpecialStatus(a.payload, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<TaggedResource>(Actions.REFRESH_RESOURCE_OK, (s, a) => {
      s.index.references[a.payload.uuid] = a.payload;
      mutateSpecialStatus(a.payload.uuid, s.index, undefined);
      return s;
    })
    .add<GeneralizedError>(Actions.REFRESH_RESOURCE_NO, (s, a) => {
      mutateSpecialStatus(a.payload.uuid, s.index, undefined);
      return s;
    })
    .add<TaggedResource[]>(Actions.BATCH_INIT, (s, { payload }) => {
      return payload.reduce((state, resource) => {
        const action = { type: Actions.INIT_RESOURCE, payload: resource };
        return initResourceReducer(state, action);
      }, s);
    });
