import {
  FolderNode,
  FolderNodeMedial,
  FolderNodeTerminal,
  RootFolderNode,
  FolderMeta,
} from "./interfaces";
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

export const PARENTLESS = -1;
type IngestFn =
  (props: IngestFnProps) => RootFolderNode;

interface IngestFnProps {
  folders: FolderNode[];
  localMetaAttributes: Record<number, FolderMeta>;
}

export const ingest: IngestFn = ({ folders, localMetaAttributes }) => {
  const output: RootFolderNode = {
    folders: [],
    noFolder: (localMetaAttributes[PARENTLESS] || {}).sequences || []
  };
  const index = folders.map(setDefaultParentId).reduce(addToIndex, emptyIndex);
  const childrenOf = (i: number) =>
    sortBy(index[i] || [], (x) => x.name.toLowerCase());

  const terminal = (x: FolderNode): FolderNodeTerminal => ({
    ...x,
    kind: "terminal",
    content: (localMetaAttributes[x.id] || {}).sequences || [],
    open: false,
    editing: false,
    // children: [],
    ...(localMetaAttributes[x.id] || {})
  });

  const medial = (x: FolderNode): FolderNodeMedial => ({
    ...x,
    kind: "medial",
    open: false,
    editing: false,
    children: childrenOf(x.id).map(terminal),
    content: (localMetaAttributes[x.id] || {}).sequences || [],
    ...(localMetaAttributes[x.id] || {})
  });

  childrenOf(-1).map((root) => {
    const children = childrenOf(root.id).map(medial);
    return output.folders.push({
      ...root,
      kind: "initial",
      open: false,
      editing: false,
      children,
      content: (localMetaAttributes[root.id] || {}).sequences || [],
      ...(localMetaAttributes[root.id] || {})
    });
  });

  return output;
};
