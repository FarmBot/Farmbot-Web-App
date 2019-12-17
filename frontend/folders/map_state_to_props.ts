import { FolderProps } from "./constants";
import { selectAllSequences } from "../resources/selectors";
import { TaggedSequence } from "farmbot";
import { RestResources } from "../resources/interfaces";
type SequenceDict = Record<string, TaggedSequence>;
type Reducer = (a: FolderProps["sequences"], b: TaggedSequence) => SequenceDict;

const reduce: Reducer = (a, b) => {
  a[b.uuid] = b;
  return a;
};

export function mapStateToFolderProps(props: RestResources): FolderProps {
  const x = props.index.sequenceFolders;

  return {
    rootFolder: x.filteredFolders ? x.filteredFolders : x.folders,
    sequences: selectAllSequences(props.index).reduce(reduce, {}),
    searchTerm: x.searchTerm
  };
}
