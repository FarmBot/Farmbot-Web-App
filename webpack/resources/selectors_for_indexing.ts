import {
  TaggedResource,
  TaggedToolSlotPointer,
  TaggedSequence,
  TaggedRegimen,
  TaggedFarmEvent,
  TaggedTool,
  TaggedPoint
} from "./tagged_resources";
import { CowardlyDictionary } from "../util";
import { ResourceIndex } from "./interfaces";
import { assertUuid } from "./selectors";

interface IndexLookupDictionary<T extends TaggedResource>
  extends CowardlyDictionary<T> { }

interface Indexer<T extends TaggedResource> {
  (index: ResourceIndex): IndexLookupDictionary<T>;
}

interface MapperFn<T extends TaggedResource> { (item: T): T | undefined; }

/** Build a function,
*    that returns a function,
*      that returns a dictionary,
*        that contains TaggedResource of kind T
*          that uses the resource's id as the dictionary key.
* */
export const buildIndexer =
  <T extends TaggedResource>(kind: T["kind"], mapper?: MapperFn<T>): Indexer<T> => {
    return function (index: ResourceIndex, ) {
      const noop: MapperFn<T> = (i) => i;
      const output: CowardlyDictionary<T> = {};
      const uuids = index.byKind[kind];
      const m = mapper || noop;
      uuids.map(uuid => {
        assertUuid(kind, uuid);
        const resource = index.references[uuid];
        if (resource
          && (resource.kind === kind)
          && resource.body.id
          && m(resource as T)) {
          output[resource.body.id] = resource as T;
        }
      });
      return output;
    };
  };

const slotMapper = (i: TaggedPoint): TaggedToolSlotPointer | undefined => {
  if (i.kind == "Point" && (i.body.pointer_type === "ToolSlot")) {
    return i as TaggedToolSlotPointer;
  }
  return undefined;
};

export const indexBySlotId =
  buildIndexer<TaggedToolSlotPointer>("Point", slotMapper);
export const indexSequenceById = buildIndexer<TaggedSequence>("Sequence");
export const indexRegimenById = buildIndexer<TaggedRegimen>("Regimen");
export const indexFarmEventById = buildIndexer<TaggedFarmEvent>("FarmEvent");
export const indexByToolId = buildIndexer<TaggedTool>("Tool");
