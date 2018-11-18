import { TaggedResource, ScopeDeclarationBodyItem, TaggedSequence } from "farmbot";
import { ResourceIndex, VariableNameMapping } from "./interfaces";
import { joinKindAndId } from "./reducer_support";
import { sanitizeNodes } from "../sequences/step_tiles/tile_move_absolute/variables_support";
import { EVERY_USAGE_KIND } from "./in_use";

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

const IN_USE: Indexer = {
  up(r, _i) {
    console.log("Doing it for " + r.kind);
    switch (r.kind) {
      case "Regimen":
        console.log("Hello, reg");
        break;
      case "Sequence":
        // It's not here- instead, we index sequence usage stats during
        // recursion. SEE: `SEQUENCE_STUFF`
        break;
      case "FarmEvent":
        console.log("INDEX STUFF HERE");
        break;
    }
  },
  down: (r, i) => EVERY_USAGE_KIND.map(kind => delete i.inUse[kind][r.uuid])
};

export const INDEXES: Indexer[] = [
  REFERENCES,
  ALL,
  BY_KIND,
  BY_KIND_AND_ID,
  SEQUENCE_STUFF,
  IN_USE
];
