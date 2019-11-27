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

export function ingest(input: FolderNode[]): RootFolderNode {
  const output: RootFolderNode = { folders: [] };
  const index = input.map(setDefaultParentId).reduce(addToIndex, emptyIndex);
  const childrenOf = (i: number) => sortBy(index[i] || [], (x) => x.name.toLowerCase());

  const terminal = (x: FolderNode): FolderNodeTerminal => ({
    ...x,
    kind: "terminal",
    content: [],
    children: []
  });

  const medial = (x: FolderNode): FolderNodeMedial => ({
    ...x,
    kind: "medial",
    children: childrenOf(x.id).map(terminal),
    content: []
  });

  const initial = (x: FolderNode) => (index[x.id] || []).length ?
    medial(x) : terminal(x);

  childrenOf(-1).map((root) => {
    const children = childrenOf(root.id).map(initial);
    return output.folders.push({
      ...root,
      kind: "initial",
      children,
      content: []
    });
  });

  return output;
}
