import { SequenceReducerState } from "../sequences/interfaces";
import { DesignerState } from "../farm_designer/interfaces";
import {
  Dictionary,
  TaggedResource,
  ResourceName,
  TaggedToolSlotPointer,
  TaggedTool,
  RestResource,
} from "farmbot";
import { RegimenState } from "../regimens/reducer";
import { FarmwareState } from "../farmware/interfaces";
import { HelpState } from "../help/reducer";
import { UsageIndex } from "./in_use";
import { SequenceMeta } from "./sequence_meta";
import { AlertReducerState } from "../messages/interfaces";
import { RootFolderNode, FolderMeta } from "../folders/interfaces";
import { PhotosState } from "../photos/reducer";
import { PointGroup } from "farmbot/dist/resources/api_resources";

export type UUID = string;
export type VariableNameSet = Record<string, SequenceMeta | undefined>;
export type UUIDSet = Record<UUID, true>;

export interface ResourceIndex {
  all: UUIDSet;
  byKind: Record<ResourceName, Record<UUID, UUID>>;
  byKindAndId: Dictionary<UUID | undefined>;
  references: Dictionary<TaggedResource | undefined>;
  /**
   * PROBLEM: _efficiently_ tracking variable declarations across all sequences.
   *
   * USE CASE:
   *  * You have a sequence `Sequence.0.1`
   *  * It has 2 variables: `variable` and `variable1`.
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
   *     "variable": { label: "variable" },
   *     "variable1": { label: "variable1" },
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
  sequenceFolders: {
    folders: RootFolderNode;
    /** Local data about a `Folder` that is stored
     * out-of-band rather than in the API. */
    localMetaAttributes: Record<number, FolderMeta>;
    searchTerm?: string;
    filteredFolders?: RootFolderNode | undefined;
    stashedOpenState?: Record<number, boolean>;
  }
}

export interface RestResources {
  /** Tells you if the sync finished yet. */
  loaded: ResourceName[];
  index: ResourceIndex;
  consumers: {
    sequences: SequenceReducerState;
    regimens: RegimenState;
    farm_designer: DesignerState;
    photos: PhotosState;
    farmware: FarmwareState;
    help: HelpState;
    alerts: AlertReducerState;
  }
}

export interface SlotWithTool {
  toolSlot: TaggedToolSlotPointer;
  tool: TaggedTool | undefined;
}

interface PointGroupPlus extends PointGroup {
  member_count?: number;
}
export type TaggedPointGroup = RestResource<"PointGroup", PointGroupPlus>;
