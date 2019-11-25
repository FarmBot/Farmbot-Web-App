import React from "react";

export const createFolder = () => Promise.resolve({});
export const deleteFolder = () => Promise.resolve({});
export const saveFolder = () => Promise.resolve({});
export const setFolderColor = () => Promise.resolve({});
export const setFolderName = () => Promise.resolve({});
export const moveFolderItem = () => Promise.resolve({});
export const moveFolder = () => Promise.resolve({});
export const toggleFolder = () => Promise.resolve({});
export const searchByNameOrFolder = () => Promise.resolve({});

export class ScratchPad extends React.Component<{}, {}> {

  render() {
    return <div>
      <br />
      <br />
      <br />
      <input placeholder="Search..." />
      <button>Create Folder</button>
      Hey!
    </div>;
  }
}
