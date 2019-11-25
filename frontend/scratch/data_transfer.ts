import {
  FlatNode,
  FlatNodeName,
  RootFolderNode
} from "./constants";

type X = Record
export function ingest(_folders: FlatNode[], names: FlatNodeName[]): RootFolderNode {
  const output = { folders: [] };
  const y = names
    .map((x: FlatNodeName): Required<FlatNodeName> => ({ ...x, parent_id: x.parent_id || -1 }));
  return output;
}
