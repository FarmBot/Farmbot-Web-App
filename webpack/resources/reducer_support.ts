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
import { arrayWrap, arrayUnwrap } from "./util";
import {
  TaggedResource,
  ScopeDeclarationBodyItem,
  TaggedSequence
} from "farmbot";
import { ResourceIndex, VariableNameMapping } from "./interfaces";
import {
  sanitizeNodes
} from "../sequences/step_tiles/tile_move_absolute/variables_support";
import {
  selectAllFarmEvents,
  findByKindAndId,
  selectAllLogs,
  selectAllRegimens
} from "./selectors_by_kind";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { betterCompact } from "../util";

export function findByUuid(index: ResourceIndex, uuid: string): TaggedResource {
  const x = index.references[uuid];
  if (x && isTaggedResource(x)) {
    return x;
  } else {
    throw new Error("BAD UUID- CANT FIND RESOURCE: " + uuid);
  }
}

type IndexDirection = "up" | "down";
type IndexerCallback = (self: TaggedResource, index: ResourceIndex) => void;
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
  up(r, i) { i.byKind[r.kind][r.uuid] = r.uuid; },
  down(r, i) { delete i.byKind[r.kind][r.uuid]; },
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

const reindexSequences = (i: ResourceIndex) => (s: TaggedSequence) => {
  // STEP 1: Sanitize nodes, tag them with unique UUIDs (for React),
  //         collect up sequence_id's, etc. NOTE: This is CPU expensive,
  //         so if you need to do tree traversal, do it now.
  const { thisSequence, callsTheseSequences } = sanitizeNodes(s.body);
  // STEP 2: Add sequence to index.references, update variable reference
  //         indexes
  updateSequenceUsageIndex(s.uuid, callsTheseSequences, i);
  // Step 3: Update the in_use stats for Sequence-to-Sequence usage.
  updateOtherSequenceIndexes({ ...s, body: thisSequence }, i);
};

const reindexAllSequences = (i: ResourceIndex) => {
  i.inUse["Sequence.Sequence"] = {};
  const mapper = reindexSequences(i);
  betterCompact(Object.keys(i.byKind["Sequence"]).map(uuid => {
    const resource = i.references[uuid];
    return (resource && resource.kind == "Sequence") ? resource : undefined;
  })).map(mapper);
};

export function reindexAllFarmEventUsage(i: ResourceIndex) {
  i.inUse["Regimen.FarmEvent"] = {};
  i.inUse["Sequence.FarmEvent"] = {};
  const whichOne: Record<ExecutableType, typeof i.inUse["Regimen.FarmEvent"]> = {
    "Regimen": i.inUse["Regimen.FarmEvent"],
    "Sequence": i.inUse["Sequence.FarmEvent"],
  };

  // Which FarmEvents use which resource?
  betterCompact(selectAllFarmEvents(i)
    .map(fe => {
      const { executable_type, executable_id } = fe.body;
      const { uuid } = findByKindAndId(i, executable_type, executable_id);
      return { exe_type: executable_type, exe_uuid: uuid, fe_uuid: fe.uuid };
    }))
    .map(({ exe_type, exe_uuid, fe_uuid }) => {
      whichOne[exe_type] = whichOne[exe_type] || {};
      whichOne[exe_type][exe_uuid] = whichOne[exe_type][exe_uuid] || {};
      whichOne[exe_type][exe_uuid][fe_uuid] = true;
    });
}

export const INDEXERS: Indexer[] = [
  REFERENCES,
  ALL,
  BY_KIND,
  BY_KIND_AND_ID,
];

type IndexerHook = Partial<Record<TaggedResource["kind"], Reindexer>>;
type Reindexer = (i: ResourceIndex, strategy: "one" | "many") => void;

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
  indexUpsert(s.index, [payload], "one");
  return s;
}

const BEFORE_HOOKS: IndexerHook = {
  Log(_index, strategy) {
    // IMPLEMENTATION DETAIL: When the app downloads a *list* of logs, we
    // replaces the entire logs collection.
    (strategy === "many") &&
      selectAllLogs(_index).map(log => indexRemove(_index, log));
  },
};

const AFTER_HOOKS: IndexerHook = {
  FarmEvent: reindexAllFarmEventUsage,
  Sequence: reindexAllSequences,
  Regimen: (i) => {
    i.inUse["Sequence.Regimen"] = {};
    const tracker = i.inUse["Sequence.Regimen"];
    selectAllRegimens(i)
      .map(reg => {
        reg.body.regimen_items.map(ri => {
          const sequence = findByKindAndId(i, "Sequence", ri.sequence_id);
          tracker[sequence.uuid] = tracker[sequence.uuid] || {};
          tracker[sequence.uuid][reg.uuid] = true;
        });
      });
  }
};

const ups = INDEXERS.map(x => x.up);
const downs = INDEXERS.map(x => x.down).reverse();

export const indexUpsert =
  (db: ResourceIndex, resources: TaggedResource[], strategy: "one" | "many") => {
    if (resources.length == 0) {
      return;
    }
    const { kind } = arrayUnwrap(resources);

    // Clean up indexes (if needed)
    const before = BEFORE_HOOKS[kind];
    before && before(db, strategy);

    // Run indexers
    ups.map(callback => {
      resources.map(resource => callback(resource, db));
    });

    // Finalize indexing (if needed)
    const after = AFTER_HOOKS[kind];
    after && after(db, strategy);
  };

export function indexRemove(db: ResourceIndex, resource: TaggedResource) {
  downs
    .map(callback => arrayWrap(resource).map(r => callback(r, db)));
  // Finalize indexing (if needed)
  const after = AFTER_HOOKS[resource.kind];
  after && after(db, "one");
}
