import { ResourceIndex } from "./interfaces";
import { TaggedResource } from "farmbot";
import { joinKindAndId } from "./reducer_support";
import { maybeTagSteps } from "./sequence_tagging";
import {
  recomputeLocalVarDeclaration
} from "../sequences/step_tiles/tile_move_absolute/variables_support";

type IndexDirection = "up" | "down";
type IndexerCallback = (self: TaggedResource, index: ResourceIndex) => void;
export interface Indexer extends Record<IndexDirection, IndexerCallback> { }

// This function should not exist- it's CPU intensive and a sign that we should
// be using Record<T, U> types.
const filterOutUuid = (tr: TaggedResource) => (id: string) => id !== tr.uuid;

const REFERENCES: Indexer = { // ========
  up(r, i) { i.references[r.uuid] = r; },
  down(r, i) { delete i.references[r.uuid]; },
};

const ALL: Indexer = {
  up(r, s) {
    s.all.push(r.uuid);
  },
  down(r, i) {
    i.all = i.all.filter(filterOutUuid(r));
  },
};

const BY_KIND: Indexer = {
  up(r, i) { i.byKind[r.kind].push(r.uuid); },
  down(r, i) {
    i.byKind[r.kind] = i.byKind[r.kind].filter(filterOutUuid(r));
  },
};

const BY_KIND_AND_ID: Indexer = {
  up(r, i) {
    r.body.id && (i.byKindAndId[joinKindAndId(r.kind, r.body.id)] = r.uuid);
  },
  down(r, i) {
    delete i.byKindAndId[joinKindAndId(r.kind, r.body.id)];
    delete i.byKindAndId[joinKindAndId(r.kind, 0)];
  },
};

const DONT_TOUCH_THIS_STUFF: Indexer = {
  up(r) {
    if (r.kind === "Sequence") {
      const recomputed = recomputeLocalVarDeclaration(r.body);
      r.body.args = recomputed.args;
      r.body.body = recomputed.body;
      maybeTagSteps(r);
    }
  },
  down(_r, _i) {
  },
};

export const INDEXES: Indexer[] = [
  REFERENCES,
  ALL,
  BY_KIND,
  BY_KIND_AND_ID,
  DONT_TOUCH_THIS_STUFF,
];
