import { Dictionary } from "farmbot/dist";
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
import { UsageIndex } from "./in_use";
import { SequenceMeta } from "./sequence_meta";

export type UUID = string;
export type VariableNameSet = Record<string, SequenceMeta | undefined>;
export type UUIDSet = Record<UUID, true>;

export interface ResourceIndex {
  all: UUIDSet;
  byKind: Record<ResourceName, Record<UUID, UUID>>;
  byKindAndId: CowardlyDictionary<UUID>;
  references: Dictionary<TaggedResource | undefined>;
  /**
   * PROBLEM: _efficiently_ tracking variable declarations across all sequences.
   *
   * USE CASE:
   *  * You have a sequence `Sequence.0.1`
   *  * It has 2 variables: `parent` and `parent1`.
   *
   * SOLUTION:
   *  * Create an index entry, indexed by UUID, for every variable declared in
   *    a sequence.
   *   * Within that entry, map the name of the var to a map of meta attrs.
   *
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
  sequenceMetas: Record<UUID, VariableNameSet | undefined>;
  /**
   * PROBLEM:
   *  * We need to _efficiently_ track which resources are in_use.
   * DISAMBIGUATION:
   *  * If resource deletion can cause a referential integrity error, it is said
   *    to be "in use"
   *  * Another way to think of the term "in use": "Can't be safely deleted"
   * SCENARION:
   *  * A sequence (`Sequence.0.1`) has 2 "consumers":
   *    * A FarmEvent that triggers it (UUID: "FarmEvent.0.2")
   *    * A Sequence ("Sequence.0.3") that calls the sequence ("Sequence.0.1")
   *      via an `execute` block.
   * SOLUTION:
   *  * Create an index (tracked by UUID), for every resource that is "inUse".
   *  * If it does not have an entry, it's not in use and can safely be deleted.
   * {
   *   // "Sequence.0.1" has two "reservations": "FarmEvent.0.2", "Sequence.0.3"
   *   "Sequence.0.1": {
   *     "FarmEvent.0.2": true,
   *     "Sequence.0.3":  true
   *   },
   *   "Sequence.0.5": undefined, // Not in use by anything
   * }
   */
  inUse: UsageIndex;
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
