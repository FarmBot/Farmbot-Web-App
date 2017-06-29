import * as _ from "lodash";
import * as moment from "moment";
import { generateReducer } from "../redux/generate_reducer";
import { RestResources, ResourceIndex } from "./interfaces";
import {
  TaggedResource,
  ResourceName,
  sanityCheck,
  isTaggedResource
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
import { OFCropResponse } from "../open_farm/index";
import {
  famrwareReducer as farmware,
  farmwareState
} from "../farmware/reducer";
import { Actions } from "../constants";

let consumerReducer = combineReducers<RestResources["consumers"]>({
  regimens,
  sequences,
  farm_designer,
  farmware
});

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
        device: [],
        farm_events: [],
        images: [],
        logs: [],
        peripherals: [],
        crops: [],
        points: [],
        regimens: [],
        sequences: [],
        tools: [],
        users: []
      },
      byKindAndId: {},
      references: {}
    }
  };
}

let initialState: RestResources = emptyState();

let afterEach = (state: RestResources, a: ReduxAction<any>) => {
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
  .add<ResourceReadyPayl>(Actions.SAVE_SPECIAL_RESOURCE, (s, { payload }) => {
    let data = arrayWrap(payload);
    let kind = payload.name;
    data.map((body: ResourceReadyPayl) => {
      let crop = body.data as OFCropResponse;
      if (crop.data) {
        let cropInfo = crop.data.attributes;
        addToIndex(s.index, kind, cropInfo, generateUuid(undefined, kind));
      }
    })
    return s;
  })
  .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
    let resource = payload;
    resource.dirty = false;
    resource.saving = false;
    if (resource
      && resource.body) {
      switch (resource.kind) {
        case "device":
        case "users":
        case "farm_events":
        case "logs":
        case "peripherals":
        case "crops":
        case "regimens":
        case "sequences":
        case "tools":
        case "points":
          reindexResource(s.index, resource);
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
    let resource = payload;
    switch (resource.kind) {
      case "device":
      case "users":
      case "farm_events":
      case "logs":
      case "peripherals":
      case "crops":
      case "regimens":
      case "sequences":
      case "tools":
      case "points":
        removeFromIndex(s.index, resource);
        break;
      default:
        whoops(Actions.DESTROY_RESOURCE_OK, payload.kind);
    }
    return s;
  })
  .add<TaggedResource>(Actions.UPDATE_RESOURCE_OK, (s, { payload }) => {
    let uuid = payload.uuid;
    s.index.references[uuid] = payload;
    let tr = s.index.references[uuid];
    if (tr) {
      tr.dirty = false;
      tr.saving = false;
      sanityCheck(tr);
      reindexResource(s.index, tr);
      return s;
    } else {
      throw new Error("BAD UUID IN UPDATE_RESOURCE_OK");
    }
  })
  .add<TaggedResource>("*_RESOURCE_NO", (s, { payload }) => {
    let uuid = payload.uuid;
    let tr = _.merge(findByUuid(s.index, uuid), payload);
    tr.dirty = true;
    tr.saving = false;
    sanityCheck(tr);
    return s;
  })
  .add<EditResourceParams>(Actions.EDIT_RESOURCE, (s, { payload }) => {
    let uuid = payload.uuid;
    let { update } = payload;
    let source = _.merge<TaggedResource>(findByUuid(s.index, uuid),
      { body: update },
      { dirty: true });
    sanityCheck(source);
    payload && isTaggedResource(source);
    return s;
  })
  .add<EditResourceParams>("OVERWRITE_RESOURCE", (s, { payload }) => {
    let uuid = payload.uuid;
    let original = findByUuid(s.index, uuid);
    original.body = payload.update as typeof original.body;
    original.dirty = true;
    sanityCheck(original);
    payload && isTaggedResource(original);
    return s;
  })
  .add<TaggedResource>("INIT_RESOURCE", (s, { payload }) => {
    let tr = payload;
    let uuid = tr.uuid;
    // TEMPORARY STUB:
    // Problem:   Old versions of FBOS send timestamp as 8601 string.
    //            New versions send it as a unix timestamp
    //            This creates backwards compat issues.
    // SOLUTINON: Convert strings to unix timestamps at runtime.
    // NOTE:      Remove this in June 2017.
    if (tr.kind === "logs" && (typeof tr.body.created_at === "string")) {
      tr.body.created_at = moment(tr.body.created_at).unix();
    }
    reindexResource(s.index, tr);
    if (tr.kind === "logs") {
      // Since logs don't come from the API all the time, they are the only
      // resource (right now) that can have an id of `undefined` and not dirty.
      findByUuid(s.index, uuid).dirty = false;
    } else {
      findByUuid(s.index, uuid).dirty = true;
    }
    sanityCheck(tr);
    return s;
  })
  .add<TaggedResource>(Actions.SAVE_RESOURCE_START, (s, { payload }) => {
    let resource = findByUuid(s.index, payload.uuid);
    resource.saving = true;
    if (!resource.body.id) { delete resource.body.id; }
    return s;
  })
  .add<ResourceReadyPayl>(Actions.RESOURCE_READY, (s, { payload }) => {
    let { name } = payload;
    /** Problem:  Most API resources are plural (array wrapped) resource.
     *            A small subset are singular (`device` and a few others),
     *            making `.map()` and friends unsafe.
     *  Solution: wrap everything in an array on the way in. */
    let unwrapped = payload.data;
    let data = arrayWrap(unwrapped);
    let { index } = s;
    s.loaded.push(name);
    index.byKind[name].map(x => {
      let resource = index.references[x];
      resource && removeFromIndex(index, resource);
    });
    addAllToIndex(index, name, data);
    return s;
  });

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
  let tr: TaggedResource = { kind, body, uuid } as any; // TODO: Fix this :(
  sanityCheck(tr);
  index.all.push(tr.uuid);
  index.byKind[tr.kind].push(tr.uuid);
  if (tr.body.id) { index.byKindAndId[tr.kind + "." + tr.body.id] = tr.uuid; }
  index.references[tr.uuid] = tr;
}

export function joinKindAndId(kind: ResourceName, id: number | undefined) {
  return `${kind}.${id || 0}`;
}

let filterOutUuid = (tr: TaggedResource) => (uuid: string) => uuid !== tr.uuid;
function removeFromIndex(index: ResourceIndex, tr: TaggedResource) {
  let { kind } = tr;
  let id = tr.body.id;
  index.all = index.all.filter(filterOutUuid(tr));
  index.byKind[tr.kind] = index.byKind[tr.kind].filter(filterOutUuid(tr));
  delete index.byKindAndId[joinKindAndId(kind, id)]
  delete index.byKindAndId[joinKindAndId(kind, 0)]
  delete index.references[tr.uuid];
}

function whoops(origin: string, kind: string) {
  let msg = `${origin}/${kind}: No handler written for this one yet.`
  throw new Error(msg);
}

export function findByUuid(index: ResourceIndex, uuid: string): TaggedResource {
  let x = index.references[uuid];
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
