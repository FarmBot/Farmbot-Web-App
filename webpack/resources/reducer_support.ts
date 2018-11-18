import { ResourceName, SpecialStatus } from "farmbot";
import { combineReducers } from "redux";
import { ReduxAction } from "../redux/interfaces";
import { helpReducer as help } from "../help/reducer";
import { designer as farm_designer } from "../farm_designer/reducer";
import { farmwareReducer as farmware } from "../farmware/reducer";
import { regimensReducer as regimens } from "../regimens/reducer";
import { sequenceReducer as sequences } from "../sequences/reducer";
import { RestResources } from "./interfaces";
import { isTaggedResource } from "./tagged_resources";
import { arrayWrap } from "./util";
import { TaggedResource, ScopeDeclarationBodyItem, TaggedSequence } from "farmbot";
import { ResourceIndex, VariableNameMapping } from "./interfaces";
import { sanitizeNodes } from "../sequences/step_tiles/tile_move_absolute/variables_support";
import { selectAllFarmEvents, findByKindAndId } from "./selectors_by_kind";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { Actions } from "../constants";

type IndexDirection = "up" | "down";
type IndexerCallback = (self: TaggedResource, index: ResourceIndex, action?: Actions) => void;
export interface Indexer extends Record<IndexDirection, IndexerCallback> { }

const REFERENCES: Indexer = {
  up: (r, i) => i.references[r.uuid] = r,
  down: (r, i) => delete i.references[r.uuid],
};

const ALL: Indexer = {
  up: (r, s) => s.all[r.uuid] = true,
  down: (r, i) => delete i.all[r.uuid],
};

const BY_KIND: Indexer = {
  up: (r, i) => i.byKind[r.kind][r.uuid] = r.uuid,
  down(r, i) {
    const byKind = i.byKind[r.kind];
    delete byKind[r.uuid];
  },
};

const BY_KIND_AND_ID: Indexer = {
  up: (r, i) => {
    if (r.body.id) {
      i.byKindAndId[joinKindAndId(r.kind, r.body.id)] = r.uuid;
    }
  },
  down(r, i) {
    delete i.byKindAndId[joinKindAndId(r.kind, r.body.id)];
    delete i.byKindAndId[joinKindAndId(r.kind, 0)];
  },
};
export const lookupReducer =
  (acc: VariableNameMapping, { args }: ScopeDeclarationBodyItem) => {
    return { ...acc, ...({ [args.label]: { label: args.label } }) };
  };

export function variableLookupTable(tr: TaggedSequence): VariableNameMapping {
  return (tr.body.args.locals.body || []).reduce(lookupReducer, {});
}

export function updateSequenceUsageIndex(myUuid: string, ids: number[], i: ResourceIndex) {
  ids.map(id => {
    const uuid = i.byKindAndId[joinKindAndId("Sequence", id)];
    if (uuid) { // `undefined` usually means "not ready".
      const inUse = i.inUse["Sequence.Sequence"][uuid] || {};
      i.inUse["Sequence.Sequence"][uuid] = { ...inUse, ...{ [myUuid]: true } };
    }
  });
}

export const updateOtherSequenceIndexes =
  (tr: TaggedSequence, i: ResourceIndex) => {
    i.references[tr.uuid] = tr;
    i.sequenceMeta[tr.uuid] = variableLookupTable(tr);
  };

const SEQUENCE_STUFF: Indexer = {
  up(r, i) {
    if (r.kind === "Sequence") {
      // STEP 1: Sanitize nodes, tag them with unique UUIDs (for React),
      //         collect up sequence_id's, etc. NOTE: This is CPU expensive,
      //         so if you need to do tree traversal, do it now.
      const { thisSequence, callsTheseSequences } = sanitizeNodes(r.body);
      // STEP 2: Add sequence to index.references, update variable reference
      //         indexes
      updateSequenceUsageIndex(r.uuid, callsTheseSequences, i);
      // Step 3: Update the in_use stats for Sequence-to-Sequence usage.
      updateOtherSequenceIndexes({ ...r, body: thisSequence }, i);
    }
  },
  down(r, i) {
    if (r.kind === "Sequence") {
      const usingSequences = i.inUse["Sequence.Sequence"];
      delete usingSequences[r.uuid];
      console.log("TODO: cleanup Sequence.Sequence in_use things");
    }
    delete i.sequenceMeta[r.uuid];
  },
};

export function reindexAllFarmEventUsage(i: ResourceIndex) {
  i.inUse["Regimen.FarmEvent"] = {};
  i.inUse["Sequence.FarmEvent"] = {};
  const whichOne: Record<ExecutableType, typeof i.inUse["Regimen.FarmEvent"]> = {
    "Regimen": i.inUse["Regimen.FarmEvent"],
    "Sequence": i.inUse["Sequence.FarmEvent"],
  };
  // Which FarmEvents use which resource?
  selectAllFarmEvents(i)
    .map(fe => ({
      exe_type: fe.body.executable_type,
      exe_uuid: findByKindAndId(i, fe.body.executable_type, fe.body.executable_id).uuid,
      fe_uuid: fe.uuid
    }))
    .map(data => {
      whichOne[data.exe_type] = whichOne[data.exe_type] || {};
      whichOne[data.exe_type][data.exe_uuid] =
        whichOne[data.exe_type][data.exe_uuid] || {};
      whichOne[data.exe_type][data.exe_uuid][data.fe_uuid];
    });
}

const IN_USE: Indexer = {
  up(r, i, a) {
    if (!(a === Actions.RESOURCE_READY)) {
      r.kind === "FarmEvent" && reindexAllFarmEventUsage(i);
    }
  },
  down: (_r, _i) => {
    // EVERY_USAGE_KIND.map(kind => delete i.inUse[kind][r.uuid]);
  }
};

export const INDEXES: Indexer[] = [
  REFERENCES,
  ALL,
  BY_KIND,
  BY_KIND_AND_ID,
  SEQUENCE_STUFF,
  IN_USE
];

export function joinKindAndId(kind: ResourceName, id: number | undefined) {
  return `${kind}.${id || 0}`;
}

/** Any reducer that uses TaggedResources (or UUIDs) must live within the
 * resource reducer. Failure to do so can result in stale UUIDs, referential
 * integrity issues and other bad stuff. The variable below contains all
 * resource consuming reducers. */
const consumerReducer = combineReducers<RestResources["consumers"]>({
  regimens,
  sequences,
  farm_designer,
  farmware,
  help
} as any); // tslint:disable-line

/** The resource reducer must have the first say when a resource-related action
 * fires off. Afterwards, sub-reducers are allowed to make sense of data
 * changes. A common use case for sub-reducers is to listen for
 * `DESTROY_RESOURCE_OK` and clean up stale UUIDs. */
export const afterEach = (state: RestResources, a: ReduxAction<unknown>) => {
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
    findByUuid(index, uuid).specialStatus = status;
  };

export function initResourceReducer(s: RestResources,
  { payload }: ReduxAction<TaggedResource>): RestResources {
  indexUpsert(s.index, payload);
  return s;
}

export function findByUuid(index: ResourceIndex, uuid: string): TaggedResource {
  const x = index.references[uuid];
  if (x && isTaggedResource(x)) {
    return x;
  } else {
    throw new Error("BAD UUID- CANT FIND RESOURCE: " + uuid);
  }
}

export function whoops(origin: string, kind: string): never {
  const msg = `${origin}/${kind}: No handler written for this one yet.`;
  throw new Error(msg);
}

const ups = INDEXES.map(x => x.up);
const downs = INDEXES.map(x => x.down).reverse();

export function indexUpsert(db: ResourceIndex, resources: TaggedResource, action?: Actions) {
  ups.map(callback => {
    arrayWrap(resources).map(resource => callback(resource, db, action));
  });
}

export function indexRemove(db: ResourceIndex, resources: TaggedResource) {
  downs.map(callback => {
    arrayWrap(resources).map(resource => callback(resource, db));
  });
}
