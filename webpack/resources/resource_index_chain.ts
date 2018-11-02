import { ResourceIndex } from "./interfaces";
import { TaggedResource } from "farmbot";
import { joinKindAndId } from "./reducer_support";
import {
  performAllTransformsOnSequence
} from "../sequences/step_tiles/tile_move_absolute/variables_support";

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
  up: (r, i) => r.body.id && (i.byKindAndId[joinKindAndId(r.kind, r.body.id)] = r.uuid),
  down(r, i) {
    delete i.byKindAndId[joinKindAndId(r.kind, r.body.id)];
    delete i.byKindAndId[joinKindAndId(r.kind, 0)];
  },
};

const SEQUENCE_STUFF: Indexer = {
  up(r, _i) {
    if (r.kind === "Sequence") {
      performAllTransformsOnSequence(r.body);
      // const locals = (r.body.args.locals.body || []);
      // i.sequenceMeta[r.uuid] = locals.map((local): SequenceVariableMeta => {
      //   switch (local.kind) {
      //     case "parameter_declaration":
      //     case "variable_declaration":
      //       return {
      //         label: local.args.label,
      //         kind: local.args.data_type
      //       };
      //   }
      // });
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
