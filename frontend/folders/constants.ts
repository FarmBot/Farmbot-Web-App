import { Color } from "farmbot/dist/corpus";
import { TaggedSequence } from "farmbot";
import { DeepPartial } from "redux";
import { Folder } from "farmbot/dist/resources/api_resources";
import { VariableNameSet, UUID } from "../resources/interfaces";

export interface FolderMeta {
  open: boolean;
  editing: boolean;
  sequences: string[];
}

interface FolderUI {
  id: number;
  name: string;
  /** We can change this to `TaggedResource` later.
   * Not going to optimize prematurely -RC */
  content: string[];
  color: Color;
  open: boolean;
  editing: boolean;
}

/** A top-level directory */
export interface FolderNodeInitial extends FolderUI {
  kind: "initial";
  children: FolderNodeMedial[];
}

/** A mid-level directory. */
export interface FolderNodeMedial extends FolderUI {
  kind: "medial";
  children: FolderNodeTerminal[];
}

/** A leaf node on the directory tree.
 * Never has a child */
export interface FolderNodeTerminal extends FolderUI {
  kind: "terminal";
  children?: undefined;
}

export type FolderUnion =
  | FolderNodeInitial
  | FolderNodeMedial
  | FolderNodeTerminal;

export interface RootFolderNode {
  folders: FolderNodeInitial[];
  noFolder: string[];
}

export interface FolderNode {
  id: number;
  color: Color;
  parent_id?: number;
  name: string;
}

export interface FolderProps {
  rootFolder: RootFolderNode;
  sequences: Record<string, TaggedSequence>;
  searchTerm: string | undefined;
  dispatch: Function;
  resourceUsage: Record<UUID, boolean | undefined>;
  sequenceMetas: Record<UUID, VariableNameSet | undefined>;
}

export interface FolderNodeState {
  settingsOpen: boolean;
}

export interface FolderState {
  toggleDirection: boolean;
  movedSequenceUuid?: string;
}

export interface FolderPanelTopProps {
  searchTerm: string | undefined;
  toggleDirection: boolean;
  toggleAll(): void;
}

export interface FolderNodeProps {
  node: FolderUnion;
  sequences: Record<string, TaggedSequence>;
  movedSequenceUuid: string | undefined;
  onMoveStart(sequenceUuid: string): void;
  onMoveEnd(folderId: number): void;
  dispatch: Function;
  resourceUsage: Record<UUID, boolean | undefined>;
  sequenceMetas: Record<UUID, VariableNameSet | undefined>;
}

export interface FolderItemProps {
  onClick(sequenceUuid: string): void;
  sequence: TaggedSequence;
  isMoveTarget: boolean;
  dispatch: Function;
  variableData: VariableNameSet | undefined;
  inUse: boolean;
}

export interface AddFolderBtn {
  folder?: DeepPartial<Folder>;
}

export interface AddSequenceProps {
  folderId?: number;
}

export interface ToggleFolderBtnProps {
  expanded: boolean;
  onClick(): void;
}
