import React from "react";

interface SFile {
  uuid: string;
}

interface SFolder {
  name: string;
  content: SFile[];
  color?: "red" | "blue"; // Stub for now.
  open?: boolean;
}

/** A top-level directory */
interface SFolderInitial extends SFolder {
  kind: "initial";
  children: (SFolderMedial | SFolderTerminal)[];
}

/** A mid-level directory. */
interface SFolderMedial extends SFolder {
  kind: "medial";
  children: SFolderTerminal;
}

/** A leaf node on the directory tree.
 * Never has a child */
interface SFolderTerminal extends SFolder {
  kind: "terminal";
  children?: never[];
}

export interface SFolderGroup { folders: SFolderInitial[]; }

export const JUST_LIKE_RORYS_MOCKUP: SFolderGroup = {
  folders: [
    {
      kind: "initial",
      name: "water schtuff",
      content: [],
      open: false,
      children: [{ kind: "terminal", name: "bar", content: [] }]
    },
    {
      kind: "initial",
      name: "Folder for Growing Things",
      content: [],
      open: false,
      children: [
        {
          kind: "terminal",
          name: "bar",
          content: []
        }
      ]
    },
    {
      kind: "initial",
      name: "Planting Seeds",
      content: [],
      open: false,
      children: [{ kind: "terminal", name: "bar", content: [] }]
    },
  ]
};

export const createFolder = () => Promise.resolve({});
export const deleteFolder = () => Promise.resolve({});
export const saveFolder = () => Promise.resolve({});
export const setFolderColor = () => Promise.resolve({});
export const setFolderName = () => Promise.resolve({});
export const moveFolderItem = () => Promise.resolve({});
export const moveFolder = () => Promise.resolve({});
export const toggleFolder = () => Promise.resolve({});
export const searchByNameOrFolder = () => Promise.resolve({});

// QUESTIONS:
// * How will we handle local (unsaved) updates?
// * How will this affect auto-sync?

// PROBLEMS:
// * We can't just add a "sort_order"
//   * 1 drag/drop operation === 40 auto_sync messages
// * Can't put unsaved sequences into folders.

// SOLUTIONS:
//  * JSON map:
//     {
//       lock_id: 12345,
//       names: {
//         "baz.foo.bar": 1,
//         "baz": 2,
//       },
//       meta: {
//         1: { color: "red", sequence_ids: [4, 5] },
//         2: { color: "blue", sequence_ids: [9] }
//       }
//     };
//  * "Materialized path" on sequence resource as attribute.
//    Eg: "directory_path: 'foo.bar.baz.0'"
//  *

// Search function should also search folder names
// Folders without any matching items should not be shown in search results
// When searching, folders should be opened to display the matching items
// Folder open/closed state should be reset upon page reload, but maintained during an app session
// Folders can be nested up to... 3 levels deep?
// Folders can only be deleted if empty
// All items in the list have a user-customizable ordering
// New folders and new sequences are added to the bottom of the list

export class ScratchPad extends React.Component<{}, {}> {

  render() {
    return <div>
      <br />
      <br />
      <br />
      Hey!
    </div>;
  }
}
