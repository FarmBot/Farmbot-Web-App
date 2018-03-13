import { findId } from "./selectors";
import {
  isTaggedFarmEvent,
  isTaggedPlantPointer,
  isTaggedRegimen,
  isTaggedSequence,
  isTaggedTool,
  isTaggedToolSlotPointer,
  ResourceName,
  sanityCheck,
  TaggedResource,
  TaggedTool,
  TaggedToolSlotPointer,
} from "./tagged_resources";
import { ResourceIndex } from "./interfaces";
import { joinKindAndId } from "./reducer";
import { isNumber } from "lodash";
import { findAll } from "./selectors";
import * as _ from "lodash";

/** FINDS: all tagged resources with particular ID */
export const findAllById =
  <T extends TaggedResource>(i: ResourceIndex, _ids: number[], k: T["kind"]) => {
    const output: TaggedResource[] = [];
    findAll<T>(i, k).map(x => x.kind === k ? output.push(x) : "");
    return output;
  };

export let byId =
  <T extends TaggedResource>(name: T["kind"]) =>
    (index: ResourceIndex, id: number): T | undefined => {
      const resources = findAll(index, name);
      const f = (x: TaggedResource) => (x.kind === name) && (x.body.id === id);
      // Maybe we should add a throw here?
      return resources.filter(f)[0] as T | undefined;
    };

export let findFarmEventById = (ri: ResourceIndex, fe_id: number) => {
  const fe = byId("FarmEvent")(ri, fe_id);
  if (fe && isTaggedFarmEvent(fe) && sanityCheck(fe)) {
    return fe;
  } else {
    const e = new Error(`Bad farm_event id: ${fe_id}`);
    throw e;
  }
};

export let maybeFindToolById = (ri: ResourceIndex, tool_id?: number):
  TaggedTool | undefined => {
  const tool = tool_id && byId("Tool")(ri, tool_id);
  if (tool && isTaggedTool(tool) && sanityCheck(tool)) {
    return tool;
  } else {
    return undefined;
  }
};

export let findToolById = (ri: ResourceIndex, tool_id: number) => {
  const tool = maybeFindToolById(ri, tool_id);
  if (tool) {
    return tool;
  } else {
    throw new Error("Bad tool id: " + tool_id);
  }
};

export let findSequenceById = (ri: ResourceIndex, sequence_id: number) => {
  const sequence = byId("Sequence")(ri, sequence_id);
  if (sequence && isTaggedSequence(sequence) && sanityCheck(sequence)) {
    return sequence;
  } else {
    throw new Error("Bad sequence id: " + sequence_id);
  }
};

export let findSlotById = byId<TaggedToolSlotPointer>("Point");
/** Find a Tool's corresponding Slot. */
export let findSlotByToolId = (index: ResourceIndex, tool_id: number) => {
  const tool = findToolById(index, tool_id);
  const query = { body: { tool_id: tool.body.id } };
  const every = Object
    .keys(index.references)
    .map(x => index.references[x]);
  const tts = _.find(every, query);
  if (tts && !isNumber(tts) && isTaggedToolSlotPointer(tts) && sanityCheck(tts)) {
    return tts;
  } else {
    return undefined;
  }
};

/** I dislike this method. */
export function findToolBySlotId(input: ResourceIndex):
  TaggedTool | undefined {
  if (JSON.parse("true")) {
    throw new Error("This method does not actually find tools by slot id...");
  }
  const wow = input
    .byKind
    .Point
    .map(x => input.references[x])
    .map((x) => {
      if (x
        && (x.kind === "Point")
        && x.body.pointer_type === "ToolSlot"
        && x.body.tool_id) {
        return maybeFindToolById(input, x.body.tool_id);
      } else {
        return undefined;
      }
    })
    .filter(x => x)[0];
  if (wow && wow.kind === "Tool") {
    return wow;
  } else {
    return undefined;
  }
}

/** Unlike other findById methods, this one allows undefined (missed) values */
export function maybeFindPlantById(index: ResourceIndex, id: number) {
  const uuid = index.byKindAndId[joinKindAndId("Point", id)];
  const resource = index.references[uuid || "nope"];
  if (resource && isTaggedPlantPointer(resource)) { return resource; }
}

export let findRegimenById = (ri: ResourceIndex, regimen_id: number) => {
  const regimen = byId("Regimen")(ri, regimen_id);
  if (regimen && isTaggedRegimen(regimen) && sanityCheck(regimen)) {
    return regimen;
  } else {
    throw new Error("Bad regimen id: " + regimen_id);
  }
};

export function findResourceById(index: ResourceIndex, kind: ResourceName,
  id: number) {
  return findId(index, kind, id);
}
