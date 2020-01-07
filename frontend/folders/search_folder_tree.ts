import { TaggedResource, TaggedSequence } from "farmbot";
import { RootFolderNode, FolderUnion } from "./interfaces";

export interface FolderSearchProps {
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
export const searchFolderTree = (props: FolderSearchProps): FolderUnion[] => {
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
  return Array
    .from(folderSet)
    .map(f => {
      return {
        ...f,
        content: f.content.filter(c => sequenceSet.has(c))
      };
    });
};
