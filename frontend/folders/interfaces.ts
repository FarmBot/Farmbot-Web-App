import { Color } from "farmbot/dist/corpus";
import { SyncStatus, TaggedSequence } from "farmbot";
import { VariableNameSet, UUID, ResourceIndex } from "../resources/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";

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
  getWebAppConfigValue: GetWebAppConfigValue;
  resources: ResourceIndex;
  menuOpen: UUID | undefined;
  syncStatus: SyncStatus | undefined;
}

export interface FolderState {
  toggleDirection: boolean;
  movedSequenceUuid?: string;
  stashedUuid?: string;
  dragging?: boolean;
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
  startSequenceMove(sequenceUuid: UUID): void;
  toggleSequenceMove(sequenceUuid?: UUID): void;
  dragging: boolean | undefined;
  onMoveEnd(folderId: number): void;
  dispatch: Function;
  resourceUsage: Record<UUID, boolean | undefined>;
  sequenceMetas: Record<UUID, VariableNameSet | undefined>;
  getWebAppConfigValue: GetWebAppConfigValue;
  resources: ResourceIndex;
  menuOpen: UUID | undefined;
  syncStatus: SyncStatus | undefined;
  searchTerm: string | undefined;
}

export interface SequenceButtonClusterProps {
  sequence: TaggedSequence;
  getWebAppConfigValue: GetWebAppConfigValue;
  dispatch: Function;
  startSequenceMove(sequenceUuid: UUID): void;
  toggleSequenceMove(sequenceUuid?: UUID): void;
}

export interface FolderButtonClusterProps {
  node: FolderUnion;
  close(): void;
}

export interface FolderNameInputProps {
  node: FolderUnion;
}

export interface FolderItemProps {
  startSequenceMove(sequenceUuid: UUID): void;
  toggleSequenceMove(sequenceUuid?: UUID): void;
  sequence: TaggedSequence;
  movedSequenceUuid: UUID | undefined;
  dispatch: Function;
  variableData: VariableNameSet | undefined;
  inUse: boolean;
  getWebAppConfigValue: GetWebAppConfigValue;
  resources: ResourceIndex;
  menuOpen: UUID | undefined;
  syncStatus: SyncStatus | undefined;
  searchTerm: string | undefined;
}

export interface SequenceDropAreaProps {
  dropAreaVisible: boolean;
  onMoveEnd(id: number): void;
  toggleSequenceMove(sequenceUuid?: UUID): void;
  folderId: number;
  folderName: string;
}

export interface SequenceDropAreaState {
  hovered: boolean;
}

export interface ToggleFolderBtnProps {
  expanded: boolean;
  onClick(): void;
}
