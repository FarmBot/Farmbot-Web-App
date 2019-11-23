import React from "react";

interface SFile { uuid: string; }

interface SFolder {
  name: string;
  content: SFile[];
  color?: "red" | "blue"; // Stub for now.
  open?: true;
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
      name: "foo",
      content: [],
      children: [
        { kind: "terminal", name: "bar", content: [] }
      ]
    }
  ]
};

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
