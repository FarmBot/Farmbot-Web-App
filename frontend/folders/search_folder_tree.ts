import { TaggedResource } from "farmbot";
import { some } from "lodash";
import { ResourceIndex } from "../resources/interfaces";
import { RootFolderNode, FolderUnion } from "./interfaces";

export interface FolderSearchProps {
  references: Record<string, TaggedResource | undefined>;
  searchTerm: string;
  root: RootFolderNode;
}

export const sequenceSearchMatch = (searchTerm: string, ri: ResourceIndex) =>
  (uuid: string) => isSearchMatchSeq(searchTerm, ri.references[uuid]);

const isSearchMatchSeq =
  (searchTerm: string, resource?: TaggedResource) => {
    if (resource && resource.kind == "Sequence") {
      const name = resource.body.name.toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    }
    return false;
  };

export const isSearchMatchFolder = (searchTerm: string, folders: FolderUnion[]) =>
  some(folders.map(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())));

/** Given an input search term, returns folder IDs (number) that match. */
export const searchFolderTree = (props: FolderSearchProps): FolderUnion[] => {
  // A folder is included if:
  //   * CASE 3: The name is a search match
  //   * CASE 4: It contains a sequence that is a match.
  //   * CASE 5: It has a child that has a search match.

  const { searchTerm } = props;
  const folderSet = new Set<FolderUnion>();

  props.root.folders.map(level1 => {
    level1.content.map(level1Sequence => { // ========= Level 1
      if (isSearchMatchSeq(searchTerm, props.references[level1Sequence])) {
        // CASE 4:
        folderSet.add(level1);
      }
    });

    if (isSearchMatchFolder(searchTerm, [level1])) {
      // CASE 3
      folderSet.add(level1);
    }

    level1.children.map(level2 => { // ================ LEVEL 2
      if (isSearchMatchFolder(searchTerm, [level1, level2])) {
        // CASE 3
        folderSet.add(level2);
        // CASE 5
        folderSet.add(level1);
      }

      level2.content.map(level2Sequence => {
        if (isSearchMatchSeq(searchTerm, props.references[level2Sequence])) {
          // CASE 4:
          folderSet.add(level2);
          // CASE 5
          folderSet.add(level1);
        }
      });
      level2.children.map(level3 => { // ============== LEVEL 3
        if (isSearchMatchFolder(searchTerm, [level1, level2, level3])) {
          // CASE 3
          folderSet.add(level3);
          // CASE 5
          folderSet.add(level2);
          // CASE 5
          folderSet.add(level1);
        }
        level3.content.map(level3Sequence => {
          if (isSearchMatchSeq(searchTerm, props.references[level3Sequence])) {
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
