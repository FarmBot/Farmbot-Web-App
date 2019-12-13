import { Everything } from "../interfaces";
import { FolderProps } from "./constants";
import { selectAllSequences } from "../resources/selectors";
import { TaggedSequence } from "farmbot";
type SequenceDict = Record<string, TaggedSequence>;
type Reducer = (a: FolderProps["sequences"], b: TaggedSequence) => SequenceDict;

const reduce: Reducer = (a, b) => {
  a[b.uuid] = b;
  return a;
};

export function mapStateToFolderProps(props: Everything): FolderProps {
  const x = props.resources.index.sequenceFolders;

  return {
    rootFolder: x.filteredFolders ? x.filteredFolders : x.folders,
    sequences: selectAllSequences(props.resources.index).reduce(reduce, {}),
    searchTerm: x.searchTerm
  };
}
