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

export interface SequenceVariableMeta {
  /** As of November 2018, the only thing you can make variables from are
   * "vector like" nodes (points, plants, mounted tools etc).
   * I'm using a single-attribute object (instead of a string) to leave the door
   * open for additional meta-data later on when the variables feature is more
   * mature. */
  label: string;
}

export type VariableNameMapping = Record<string, SequenceVariableMeta>;
export interface ResourceIndex {
  all: Record<UUID, true>;
  byKind: Record<ResourceName, Record<UUID, UUID>>;
  byKindAndId: CowardlyDictionary<UUID>;
  references: Dictionary<TaggedResource | undefined>;
  /**
   * PROBLEM:
   *  * We need to _efficiently_ track which sequences declare which variables
   * SCENARION:
   *  * You have a sequence `Sequence.0.1`
   *  * It has 2 variables: `parent` and `parent1`.
   * SOLUTION:
   *  * Create an index entry, indexed by UUID, for every variable declared in
   *    a sequence.
   *   * Within that entry, map the name of the var to a map of meta attrs.
   * {
   *   ...
   *   "Sequence.0.1": {
   *     ...
   *     "parent": { label: "parent" },
   *     "parent1": { label: "parent1" },
   *   }
   *   ...
   * }
   */
  sequenceMeta: Record<UUID, VariableNameMapping>;
  inUse: Record<UUID, boolean>
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
