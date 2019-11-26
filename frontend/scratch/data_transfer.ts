import { RootFolderNode, FolderNode } from "./constants";

type FoldersIndexedByParentId = Record<number, FolderNode[]>;

/** Set empty `parent_id` to -1 to increase index simplicity. */
const setDefaultParentId = (input: FolderNode): Required<FolderNode> => {
  return { ...input, parent_id: input.parent_id || -1 };
};

const addToIndex =
  (accumulator: FoldersIndexedByParentId, item: Required<FolderNode>) => {
    const key = item.parent_id;
    const value = accumulator[key] || [];

    return { ...accumulator, [key]: [...value, item] };
  };

const emptyIndex: FoldersIndexedByParentId = {};

export function ingest(input: FolderNode[]): RootFolderNode {
  const output: RootFolderNode = { folders: [] };
  const index = input.map(setDefaultParentId).reduce(addToIndex, emptyIndex);
  (index[-1] || []).map(y => output.folders.push({
    ...y,
    kind: "initial",
    children: [],
    content: []
  }));
  return output;
}
