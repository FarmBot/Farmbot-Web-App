import { Color } from "farmbot/dist/corpus";

export interface FolderMeta {
  open?: boolean;
  editing?: boolean;
}

interface FolderUI {
  id: number;
  name: string;
  /** We can change this to `TaggedResource` later.
   * Not going to optimize prematurely -RC */
  content: string[];
  color: Color;
  open?: boolean;
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
  children: [];
}

export type FolderUnion =
  | FolderNodeInitial
  | FolderNodeMedial
  | FolderNodeTerminal;

export interface RootFolderNode {
  folders: FolderNodeInitial[];
  folderless: string[];
}

/** === THIS WILL LIVE ON THE API === */
export interface FolderNode {
  id: number;
  color: Color;
  parent_id?: number;
  name: string;
}
