import {
  FolderNode,
  FolderNodeMedial,
  FolderNodeTerminal,
  RootFolderNode,
} from "./constants";

type FoldersIndexedByParentId = Record<number, FolderNode[]>;
type Descendant = FolderNodeMedial | FolderNodeTerminal;

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

  (index[-1] || []).map((level1) => {
    const level2 = index[level1.id] || [];

    return output.folders.push({
      ...level1,
      kind: "initial",
      children: level2.map((x): Descendant => {
        // Do an if branch to determin if kind is `medial` or `terminal`.
        if (index[x.id].length) { // medial node
          return {
            ...x,
            kind: "medial",
            children: (index[x.id] || []).map((z): FolderNodeTerminal => {
              return { // You stopped here.
                kind: "terminal"
              };
            }),
            content: []
          };
        } else { // terminal node
          return {
            ...x,
            kind: "terminal",
            children: [],
            content: []
          };
        }
      }),
      content: []
    });
  });

  return output;
}
