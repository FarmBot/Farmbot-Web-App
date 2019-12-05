import {
  FolderNode,
  FolderNodeMedial,
  FolderNodeTerminal,
  RootFolderNode,
} from "./constants";
import { sortBy } from "lodash";

type FoldersIndexedByParentId = Record<number, FolderNode[]>;

/** Set empty `parent_id` to -1 to increase index simplicity. */
const setDefaultParentId = (input: FolderNode): Required<FolderNode> => {
  return { ...input, parent_id: input.parent_id || -1 };
};

type AddToIndex = (a: FoldersIndexedByParentId, i: Required<FolderNode>) =>
  Record<number, FolderNode[] | undefined>;
const addToIndex: AddToIndex = (accumulator, item) => {
  const key = item.parent_id;
  const lastValue: FolderNode[] = accumulator[key] || [];
  const nextValue: FolderNode[] = [...lastValue, item];
  return { ...accumulator, [key]: nextValue };
};

const emptyIndex: FoldersIndexedByParentId = {};

export type SequenceIndexedByParentId = Record<number, string[] | undefined>;
const PARENTLESS = -1;
type IngestFn =
  (props: IngestFnProps) => RootFolderNode;

interface IngestFnProps {
  folders: FolderNode[];
  /** "Which sequences are using this folder as their parent?"
   * Key is a number, representing a folder ID.
   * Value is a string, representing sequence UUIDs
   * (sequences that are embedded in the folders) */
  parentIndex: Record<number, string[] | undefined>;
}

export const ingest: IngestFn = ({ folders, parentIndex }) => {
  const output: RootFolderNode = {
    folders: [],
    noFolder: parentIndex[PARENTLESS] || []
  };
  const index = folders.map(setDefaultParentId).reduce(addToIndex, emptyIndex);
  const childrenOf = (i: number) => sortBy(index[i] || [], (x) => x.name.toLowerCase());

  const terminal = (x: FolderNode): FolderNodeTerminal => ({
    ...x,
    kind: "terminal",
    content: parentIndex[x.id] || [],
    children: []
  });

  const medial = (x: FolderNode): FolderNodeMedial => ({
    ...x,
    kind: "medial",
    children: childrenOf(x.id).map(terminal),
    content: parentIndex[x.id] || []
  });

  childrenOf(-1).map((root) => {
    const children = childrenOf(root.id).map(medial);
    return output.folders.push({
      ...root,
      kind: "initial",
      children,
      content: parentIndex[root.id] || []
    });
  });

  return output;
};
