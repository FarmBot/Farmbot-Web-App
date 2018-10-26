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
import { generateUuid } from "./util";
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
import {
  farmwareReducer as farmware,
  farmwareState
} from "../farmware/reducer";
import {
  helpReducer as help,
  initialState as helpState
} from "../help/reducer";
import { maybeTagSteps as dontTouchThis } from "./sequence_tagging";
import {
  recomputeLocalVarDeclaration
} from "../sequences/step_tiles/tile_move_absolute/variables_support";

const consumerReducer = combineReducers<RestResources["consumers"]>({
  regimens,
  sequences,
  farm_designer,
  farmware,
  help
} as any); // tslint:disable-line

export function emptyState(): RestResources {
  return {
    consumers: {
      sequences: sequenceState,
      regimens: regimenState,
      farm_designer: designerState,
      farmware: farmwareState,
      help: helpState,
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

export const initialState: RestResources = emptyState();

export const afterEach = (state: RestResources, a: ReduxAction<object>) => {
  state.consumers = consumerReducer({
    sequences: state.consumers.sequences,
    regimens: state.consumers.regimens,
    farm_designer: state.consumers.farm_designer,
    farmware: state.consumers.farmware,
    help: state.consumers.help,
  }, a);
  return state;
};

/** Helper method to change the `specialStatus` of a resource in the index */
export const mutateSpecialStatus =
  (uuid: string, index: ResourceIndex, status = SpecialStatus.SAVED) => {
    const resource = index.references[uuid];
    if (resource) {
      resource.specialStatus = status;
    } else {
      throw new Error("Refreshed a non-existent resource");
    }
  };

export function addAllToIndex<T extends TaggedResource>(i: ResourceIndex,
  kind: T["kind"],
  all: T["body"][]) {
  all.map(function (body) {
    return addOneToIndex(i, kind, body, generateUuid(body.id, kind));
  });
}

function addOneToIndex<T extends TaggedResource>(index: ResourceIndex,
  kind: T["kind"],
  body: T["body"],
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

export function removeFromIndex(index: ResourceIndex, tr: TaggedResource) {
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

export function whoops(origin: string, kind: string): never {
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

export function reindexResource(i: ResourceIndex, r: TaggedResource) {
  removeFromIndex(i, r);
  addOneToIndex(i, r.kind, r.body, r.uuid);
}

/** If the body of a sequence changes, we need to re-traverse the tree to pull
 * out relevant variable names. We try to avoid this via diffing. */
export function maybeRecalculateLocalSequenceVariables(next: TaggedResource) {
  (next.kind === "Sequence") && doRecalculateLocalSequenceVariables(next);
}

function doRecalculateLocalSequenceVariables(next: TaggedSequence) {
  const recomputed = recomputeLocalVarDeclaration(next.body);
  next.body.args = recomputed.args;
  next.body.body = recomputed.body;
}

export function initResourceReducer(s: RestResources,
  { payload }: ReduxAction<TaggedResource>): RestResources {
  const tr = payload;
  reindexResource(s.index, tr);
  s.index.references[tr.uuid] = tr;
  sanityCheck(tr);
  dontTouchThis(tr);
  return s;
}
