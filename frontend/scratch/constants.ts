import { Color } from "farmbot/dist/corpus";

interface SFile { uuid: string; }

interface FolderNode {
  name: string;
  content: SFile[];
  color?: Color;
  open?: boolean;
}

/** A top-level directory */
interface FolderNodeInitial extends FolderNode {
  kind: "initial";
  children: (FolderNodeMedial | FolderNodeTerminal)[];
}

/** A mid-level directory. */
interface FolderNodeMedial extends FolderNode {
  kind: "medial";
  children: FolderNodeTerminal;
}

/** A leaf node on the directory tree.
 * Never has a child */
interface FolderNodeTerminal extends FolderNode {
  kind: "terminal";
  children?: never[];
}

export interface RootFolderNode {
  folders: FolderNodeInitial[];
}

/** === THIS WILL LIVE ON THE API === */
export interface FlatNode {
  id: number;
  name_id: number;
  color: Color;
  sequence_ids: number[];
}

/** === THIS WILL LIVE ON THE API === */
export interface FlatNodeName {
  id: number;
  value: string;
  parent_id?: number;
}

export const MOCKUP_SEQUENCES: Record<number, string> = {
  1: "Another sequence",
  2: "Some random sequence",
  3: "Planting seeds",
  4: "Purple rain",
  5: "Make it rain",
};

export const MOCKUP_NODE_NAMES: FlatNodeName[] = [
  { id: 1, value: "Water stuff", parent_id: undefined },
  { id: 2, value: "Folder for growing things", parent_id: undefined },
  { id: 3, value: "subfolder", parent_id: 2 },
  { id: 4, value: "tests", parent_id: undefined }
];

export const MOCKUP_FLAT_NODES: FlatNode[] = [
  { id: 1, name_id: 1, color: "red", sequence_ids: [] },
  { id: 1, name_id: 2, color: "red", sequence_ids: [] },
  { id: 1, name_id: 3, color: "red", sequence_ids: [5, 4] },
  { id: 1, name_id: 4, color: "red", sequence_ids: [] },
];

export const MOCKUP_TREE: RootFolderNode = {
  folders: []
};
