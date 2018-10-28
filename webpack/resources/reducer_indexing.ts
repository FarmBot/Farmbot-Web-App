import { TaggedResource, SpecialStatus, TaggedSequence } from "farmbot";
import { ResourceIndex } from "./interfaces";
import { generateUuid } from "./util";
import { sanityCheck } from "./tagged_resources";
import { joinKindAndId } from "./reducer_support";
import { maybeTagSteps as dontTouchThis } from "./sequence_tagging";
import {
  recomputeLocalVarDeclaration
} from "../sequences/step_tiles/tile_move_absolute/variables_support";

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

const filterOutUuid = (tr: TaggedResource) => (id: string) => id !== tr.uuid;

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
