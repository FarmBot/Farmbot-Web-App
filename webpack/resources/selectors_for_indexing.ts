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
import {
  ResourceIndex,
  SlotWithTool
} from "./interfaces";
import {
  selectAllTools,
  selectAllToolSlotPointers,
  maybeFindToolById
} from "./selectors";
import { assertUuid } from "./util";

interface IndexLookupDictionary<T extends TaggedResource>
  extends CowardlyDictionary<T> { }

interface Indexer<T extends TaggedResource> {
  (index: ResourceIndex): IndexLookupDictionary<T>;
}

interface MapperFn<T extends TaggedResource> { (item: T): T | undefined; }

type StringMap = CowardlyDictionary<string>;

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

export function mapToolIdToName(input: ResourceIndex) {
  return selectAllTools(input)
    .map(x => ({ key: "" + x.body.id, val: x.body.name }))
    .reduce((x, y) => ({ ...{ [y.key]: y.val, ...x } }), {} as StringMap);
}

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
