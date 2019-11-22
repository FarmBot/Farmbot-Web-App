import React from "react";

type Level = 1 | 2 | 3;

interface SFile { uuid: string; }

interface SFolder {
  color: "red" | "blue"; // Stub for now.
  name: string;
  open: boolean;
  child: SFolder;
  content: SFile[];
}

export interface SFolderGroup {
  levels: Record<Level, SFolder>;
}

// Search function should also search folder names
// Folders without any matching items should not be shown in search results
// When searching, folders should be opened to display the matching items
// Folder open/closed state should be reset upon page reload, but maintained during an app session
// Folders can be nested up to... 3 levels deep?
// Folders can only be deleted if empty
// All items in the list have a user-customizable ordering
// New folders and new sequences are added to the bottom of the list

export class ScratchPad extends React.Component<{}, {}> {
  componentDidMount() {
    alert("Hello?");
  }

  render() {
    return <div>
      <br />
      <br />
      <br />
      Hey!
    </div>;
  }
}
