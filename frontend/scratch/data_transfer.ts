import {
  FlatNode,
  FlatNodeName,
  RootFolderNode
} from "./constants";

type NodeName = Required<FlatNodeName>;
type NodeNameIndex = Record<number, NodeName[]>;

const z: Readonly<NodeNameIndex> = {};

const mapper =
  (x: FlatNodeName): NodeName => ({ ...x, parent_id: x.parent_id || -1 });

const reducer = (accum: NodeNameIndex, item: NodeName): NodeNameIndex => {
  const { parent_id } = item;
  const list = (accum[parent_id] || []);

  return { ...accum, [parent_id]: [...list, item] };
};

export function ingest(_folders: FlatNode[], names: FlatNodeName[]): RootFolderNode {
  const output = { folders: [] };
  // const nameIndex =
  names.map(mapper).reduce(reducer, z);
  // const keys: keyof typeof nameIndex =
  //   Object.keys(nameIndex).map(x => parseInt(x, 10)).sort();
  // keys.
  return output;
}
