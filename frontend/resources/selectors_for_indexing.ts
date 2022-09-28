import {
  TaggedResource,
  TaggedSequence,
  TaggedRegimen,
  TaggedFarmEvent,
  Dictionary,
} from "farmbot";
import {
  ResourceIndex,
  SlotWithTool,
} from "./interfaces";
import {
  selectAllToolSlotPointers,
  maybeFindToolById,
} from "./selectors";
import { assertUuid } from "./util";

type IndexLookupDictionary<T extends TaggedResource> = Dictionary<T | undefined>;
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
const buildIndexer =
  <T extends TaggedResource>(kind: T["kind"], mapper?: MapperFn<T>): Indexer<T> => {
    return function (index: ResourceIndex) {
      const noop: MapperFn<T> = (i) => i;
      const output: Dictionary<T | undefined> = {};
      const uuids = Object.keys(index.byKind[kind]);
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

export const indexSequenceById = buildIndexer<TaggedSequence>("Sequence");
export const indexRegimenById = buildIndexer<TaggedRegimen>("Regimen");
export const indexFarmEventById = buildIndexer<TaggedFarmEvent>("FarmEvent");

/** For those times that you need to ref a tool and slot together. */
export function joinToolsAndSlot(index: ResourceIndex): SlotWithTool[] {
  return selectAllToolSlotPointers(index)
    .map(function (toolSlot) {
      return {
        toolSlot,
        tool: maybeFindToolById(index, toolSlot.body.tool_id)
      };
    });
}
