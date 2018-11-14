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

const IN_USE: Indexer = {
  up(r, _i) {
    switch (r.kind) {
      case "Regimen":
        r.body.regimen_items.map(x => x.sequence_id);
        break;
      case "Sequence":
        console.log("Handle this in sanitizeNodes()");
        break;
      case "FarmEvent":
        r.body.executable_type;
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
