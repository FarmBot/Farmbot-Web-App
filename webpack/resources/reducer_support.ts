import {
  ResourceName,
  ScopeDeclarationBodyItem,
  SpecialStatus,
  TaggedResource,
  TaggedSequence
} from "farmbot";
import { combineReducers } from "redux";
import { ReduxAction } from "../redux/interfaces";
import { helpReducer as help } from "../help/reducer";
import { designer as farm_designer } from "../farm_designer/reducer";
import { farmwareReducer as farmware } from "../farmware/reducer";
import { regimensReducer as regimens } from "../regimens/reducer";
import { sequenceReducer as sequences } from "../sequences/reducer";
import { sanitizeNodes } from "../sequences/step_tiles/tile_move_absolute/variables_support";
import { ResourceIndex, RestResources, VariableNameMapping } from "./interfaces";
import { isTaggedResource } from "./tagged_resources";
import { arrayWrap } from "./util";

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

const SEQUENCE_STUFF: Indexer = {
  up(r, i) {
    if (r.kind === "Sequence") {
      const tr = { ...r, body: sanitizeNodes(r.body) };
      i.references[r.uuid] = tr;
      i.sequenceMeta[r.uuid] = variableLookupTable(tr);
    }
  },
  down(r, i) {
    delete i.sequenceMeta[r.uuid];
  },
};

export const INDEXES: Indexer[] = [
  REFERENCES,
  ALL,
  BY_KIND,
  BY_KIND_AND_ID,
  SEQUENCE_STUFF,
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

export function indexUpsert(db: ResourceIndex, resources: TaggedResource) {
  ups.map(callback => {
    arrayWrap(resources).map(resource => callback(resource, db));
  });
}

const downs = INDEXES.map(x => x.down).reverse();

export function indexRemove(db: ResourceIndex, resources: TaggedResource) {
  downs.map(callback => {
    arrayWrap(resources).map(resource => callback(resource, db));
  });
}
