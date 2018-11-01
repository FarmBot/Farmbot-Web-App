import { Dictionary } from "farmbot/dist";
/** Like Dictionary<T>, except more cautious about null values. */
import { SequenceReducerState } from "../sequences/interfaces";
import { DesignerState } from "../farm_designer/interfaces";
import { CowardlyDictionary } from "../util";
import {
  TaggedResource,
  ResourceName,
  TaggedToolSlotPointer,
  TaggedTool
} from "farmbot";
import { RegimenState } from "../regimens/reducer";
import { FarmwareState } from "../farmware/interfaces";
import { HelpState } from "../help/reducer";

type UUID = string;

export interface ResourceIndex {
  all: UUID[];
  byKind: Record<ResourceName, CowardlyDictionary<UUID>>;
  byKindAndId: CowardlyDictionary<UUID>;
  references: Dictionary<TaggedResource | undefined>;
}

export interface RestResources {
  /** Tells you if the sync finished yet. */
  loaded: ResourceName[];
  index: ResourceIndex;
  consumers: {
    sequences: SequenceReducerState;
    regimens: RegimenState;
    farm_designer: DesignerState;
    farmware: FarmwareState;
    help: HelpState;
  }
}

export interface SlotWithTool {
  toolSlot: TaggedToolSlotPointer;
  tool: TaggedTool | undefined;
}
