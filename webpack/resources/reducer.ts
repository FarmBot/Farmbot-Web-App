import { merge } from "lodash";
import { generateReducer } from "../redux/generate_reducer";
import { RestResources, ResourceIndex } from "./interfaces";
import {
  TaggedResource,
  ResourceName,
  SpecialStatus,
  TaggedSequence
} from "farmbot";
import {
  sanityCheck,
  isTaggedResource,
} from "./tagged_resources";
import { generateUuid, arrayWrap } from "./util";
import { EditResourceParams } from "../api/interfaces";
import {
  initialState as sequenceState,
  sequenceReducer as sequences,
} from "../sequences/reducer";
import {
  initialState as regimenState,
  regimensReducer as regimens
} from "../regimens/reducer";
import { combineReducers } from "redux";
import { ReduxAction } from "../redux/interfaces";
import {
  designer as farm_designer,
  initialState as designerState
} from "../farm_designer/reducer";
import { ResourceReadyPayl } from "../sync/actions";
import {
  farmwareReducer as farmware,
  farmwareState
} from "../farmware/reducer";
import { Actions } from "../constants";
import { maybeTagSteps as dontTouchThis } from "./sequence_tagging";
import { GeneralizedError } from "./actions";
import {
  recomputeLocalVarDeclaration
} from "../sequences/step_tiles/tile_move_absolute/variables_support";
import { equals, defensiveClone } from "../util";

const consumerReducer = combineReducers<RestResources["consumers"]>({
  regimens,
  sequences,
  farm_designer,
  farmware
} as any); // tslint:disable-line

export function emptyState(): RestResources {
  return {
    consumers: {
      sequences: sequenceState,
      regimens: regimenState,
      farm_designer: designerState,
      farmware: farmwareState
    },
    loaded: [],
    index: {
      all: [],
      byKind: {
        WebcamFeed: [],
        Device: [],
        FarmEvent: [],
        Image: [],
        Plant: [],
        Log: [],
        Peripheral: [],
        Crop: [],
        Point: [],
        Regimen: [],
        Sequence: [],
        Tool: [],
        User: [],
        FbosConfig: [],
        FirmwareConfig: [],
        WebAppConfig: [],
        SensorReading: [],
        Sensor: [],
        FarmwareInstallation: [],
        FarmwareEnv: [],
        PinBinding: [],
        PlantTemplate: [],
        SavedGarden: [],
        DiagnosticDump: []
      },
      byKindAndId: {},
      references: {}
    }
  };
}

const initialState: RestResources = emptyState();

const afterEach = (state: RestResources, a: ReduxAction<object>) => {
  state.consumers = consumerReducer({
    sequences: state.consumers.sequences,
    regimens: state.consumers.regimens,
    farm_designer: state.consumers.farm_designer,
    farmware: state.consumers.farmware
  }, a);
  return state;
};

/** Responsible for all RESTful resources. */
export let resourceReducer = generateReducer
  <RestResources>(initialState, afterEach)
  .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
    const resource = payload;
    resource.specialStatus = SpecialStatus.SAVED;
    if (resource
      && resource.body) {
      switch (resource.kind) {
        case "Crop":
        case "Device":
        case "DiagnosticDump":
        case "FarmEvent":
        case "FarmwareInstallation":
        case "FbosConfig":
        case "FirmwareConfig":
        case "Log":
        case "Peripheral":
        case "PinBinding":
        case "PlantTemplate":
        case "Point":
        case "Regimen":
        case "SavedGarden":
        case "Sensor":
        case "Sequence":
        case "Tool":
        case "User":
        case "WebAppConfig":
        case "WebcamFeed":
          reindexResource(s.index, resource);
          dontTouchThis(resource);
          s.index.references[resource.uuid] = resource;
          break;
        default:
          whoops(Actions.SAVE_RESOURCE_OK, payload.kind);
      }
    } else {
      throw new Error("Somehow, a resource was created without an ID?");
    }
    return s;
  })
  .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
    const resource = payload;
    switch (resource.kind) {
      case "Crop":
      case "Device":
      case "DiagnosticDump":
      case "FarmEvent":
      case "FarmwareInstallation":
      case "FbosConfig":
      case "FirmwareConfig":
      case "Image":
      case "Log":
      case "Peripheral":
      case "PinBinding":
      case "PlantTemplate":
      case "Point":
      case "Regimen":
      case "SavedGarden":
      case "Sensor":
      case "SensorReading":
      case "Sequence":
      case "Tool":
      case "User":
      case "WebAppConfig":
      case "WebcamFeed":
        removeFromIndex(s.index, resource);
        break;
      default:
        whoops(Actions.DESTROY_RESOURCE_OK, payload.kind);
    }
    return s;
  })
  .add<TaggedResource>(Actions.UPDATE_RESOURCE_OK, (s, { payload }) => {
    const uuid = payload.uuid;
    s.index.references[uuid] = payload;
    const tr = s.index.references[uuid];
    if (tr) {
      tr.specialStatus = SpecialStatus.SAVED;
      sanityCheck(tr);
      dontTouchThis(tr);
      reindexResource(s.index, tr);
      return s;
    } else {
      throw new Error("BAD UUID IN UPDATE_RESOURCE_OK");
    }
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

/** Helper method to change the `specialStatus` of a resource in the index */
const mutateSpecialStatus =
  (uuid: string, index: ResourceIndex, status = SpecialStatus.SAVED) => {
    const resource = index.references[uuid];
    if (resource) {
      resource.specialStatus = status;
    } else {
      throw new Error("Refreshed a non-existent resource");
    }
  };

interface HasID {
  id?: number | undefined;
}

function addAllToIndex<T extends HasID>(i: ResourceIndex,
  kind: ResourceName,
  all: T[]) {
  all.map(function (tr) {
    return addToIndex(i, kind, tr, generateUuid(tr.id, kind));
  });
}

function addToIndex<T>(index: ResourceIndex,
  kind: ResourceName,
  body: T,
  uuid: string) {
  const tr: TaggedResource = {
    kind, body, uuid, specialStatus: SpecialStatus.SAVED
    // tslint:disable-next-line:no-any
  } as any;
  sanityCheck(tr);
  index.all.push(tr.uuid);
  index.byKind[tr.kind].push(tr.uuid);
  if (tr.body.id) { index.byKindAndId[tr.kind + "." + tr.body.id] = tr.uuid; }
  dontTouchThis(tr);
  index.references[tr.uuid] = tr;
}

export function joinKindAndId(kind: ResourceName, id: number | undefined) {
  return `${kind}.${id || 0}`;
}

const filterOutUuid =
  (tr: TaggedResource) => (uuid: string) => uuid !== tr.uuid;

function removeFromIndex(index: ResourceIndex, tr: TaggedResource) {
  const { kind } = tr;
  const id = tr.body.id;
  index.all = index.all.filter(filterOutUuid(tr));
  if (index.byKind[tr.kind]) {
    index.byKind[tr.kind] = index.byKind[tr.kind].filter(filterOutUuid(tr));
    delete index.byKindAndId[joinKindAndId(kind, id)];
    delete index.byKindAndId[joinKindAndId(kind, 0)];
    delete index.references[tr.uuid];
  } else {
    console.log("No index found for tr.kind: " + tr.kind);
  }
}

function whoops(origin: string, kind: string) {
  const msg = `${origin}/${kind}: No handler written for this one yet.`;
  throw new Error(msg);
}

export function findByUuid(index: ResourceIndex, uuid: string): TaggedResource {
  const x = index.references[uuid];
  if (x && isTaggedResource(x)) {
    return x;
  } else {
    throw new Error("BAD UUID- CANT FIND RESOURCE: " + uuid);
  }
}

function reindexResource(i: ResourceIndex, r: TaggedResource) {
  removeFromIndex(i, r);
  addToIndex(i, r.kind, r.body, r.uuid);
}

/** If the body of a sequence changes, we need to re-traverse the tree to pull
 * out relevant variable names. We try to avoid this via diffing. */
function maybeRecalculateLocalSequenceVariables(next: TaggedResource) {
  (next.kind === "Sequence") && doRecalculateLocalSequenceVariables(next);
}

function doRecalculateLocalSequenceVariables(next: TaggedSequence) {
  const recomputed = recomputeLocalVarDeclaration(next.body);
  next.body.args = recomputed.args;
  next.body.body = recomputed.body;
}

function initResourceReducer(s: RestResources,
  { payload }: ReduxAction<TaggedResource>): RestResources {
  const tr = payload;
  reindexResource(s.index, tr);
  s.index.references[tr.uuid] = tr;
  sanityCheck(tr);
  dontTouchThis(tr);
  return s;
}
