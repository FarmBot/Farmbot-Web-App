import {
  FolderNode,
  FolderNodeMedial,
  FolderNodeTerminal,
  RootFolderNode,
  FolderMeta,
  FolderUnion,
} from "./constants";
import { sortBy } from "lodash";
import {
  TaggedResource,
  TaggedSequence
} from "farmbot/dist/resources/tagged_resource";

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
  const childrenOf = (i: number) => sortBy(index[i] || [], (x) => x.name.toLowerCase());

  const terminal = (x: FolderNode): FolderNodeTerminal => ({
    ...x,
    kind: "terminal",
    content: (localMetaAttributes[x.id] || {}).sequences || [],
    open: true,
    editing: false,
    // children: [],
    ...(localMetaAttributes[x.id] || {})
  });

  const medial = (x: FolderNode): FolderNodeMedial => ({
    ...x,
    kind: "medial",
    open: true,
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
      open: true,
      editing: false,
      children,
      content: (localMetaAttributes[root.id] || {}).sequences || [],
      ...(localMetaAttributes[root.id] || {})
    });
  });

  return output;
};
interface FolderSearchProps {
  references: Record<string, TaggedResource | undefined>;
  input: string;
  root: RootFolderNode;
}

const isSearchMatchSeq =
  (searchTerm: string, s?: TaggedResource): s is TaggedSequence => {
    if (s && s.kind == "Sequence") {
      const name = s.body.name.toLowerCase();
      return name.includes(searchTerm);
    } else {
      return false;
    }
  };

const isSearchMatchFolder = (searchTerm: string, f: FolderUnion) => {
  if (f.name.toLowerCase().includes(searchTerm)) {
    return true;
  }

  return false;
};

/** Given an input search term, returns folder IDs (number) and Sequence UUIDs
 * that match */
export const searchFoldersAndSequencesForTerm = (props: FolderSearchProps) => {
  // A sequence is included if:
  //   * CASE 1: The name is a search match
  //   * CASE 2: The containing folder is a search match.

  // A folder is included if:
  //   * CASE 3: The name is a search match
  //   * CASE 4: It contains a sequence that is a match.
  //   * CASE 5: It has a child that has a search match.

  const searchTerm = props.input.toLowerCase();
  const sequenceSet = new Set<string>();
  const folderSet = new Set<FolderUnion>();

  props.root.folders.map(level1 => {
    level1.content.map(level1Sequence => { // ========= Level 1
      if (isSearchMatchSeq(searchTerm, props.references[level1Sequence])) {
        // CASE 1:
        sequenceSet.add(level1Sequence);
        // CASE 4:
        folderSet.add(level1);
      }
    });

    if (isSearchMatchFolder(searchTerm, level1)) {
      // CASE 2
      level1.content.map(uuid => sequenceSet.add(uuid));
      // CASE 3
      folderSet.add(level1);
    }

    level1.children.map(level2 => { // ================ LEVEL 2
      if (isSearchMatchFolder(searchTerm, level2)) {
        // CASE 2
        level2.content.map(uuid => sequenceSet.add(uuid));
        // CASE 3
        folderSet.add(level2);
        // CASE 5
        folderSet.add(level1);
      }

      level2.content.map(level2Sequence => {
        if (isSearchMatchSeq(searchTerm, props.references[level2Sequence])) {
          // CASE 1:
          sequenceSet.add(level2Sequence);
          // CASE 4:
          folderSet.add(level2);
          // CASE 5
          folderSet.add(level1);
        }
      });
      level2.children.map(level3 => { // ============== LEVEL 3
        if (isSearchMatchFolder(searchTerm, level3)) {
          // CASE 2
          level3.content.map(uuid => sequenceSet.add(uuid));
          // CASE 3
          folderSet.add(level3);
          // CASE 5
          folderSet.add(level2);
          // CASE 5
          folderSet.add(level1);
        }
        level3.content.map(level3Sequence => {
          if (isSearchMatchSeq(searchTerm, props.references[level3Sequence])) {
            // CASE 1:
            sequenceSet.add(level3Sequence);
            // CASE 3
            folderSet.add(level3);
            // CASE 5
            folderSet.add(level2);
            // CASE 5
            folderSet.add(level1);
          }
        });
      });
    });
  });

  return Array.from(folderSet);
};
