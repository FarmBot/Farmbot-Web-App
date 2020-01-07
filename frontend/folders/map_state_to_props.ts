import { FolderProps } from "./interfaces";
import { selectAllSequences } from "../resources/selectors";
import { TaggedSequence } from "farmbot";
import { resourceUsageList } from "../resources/in_use";
import { Everything } from "../interfaces";
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
    searchTerm: x.searchTerm,
    dispatch: props.dispatch,
    sequenceMetas: props.resources.index.sequenceMetas,
    resourceUsage: resourceUsageList(props.resources.index.inUse),
  };
}
