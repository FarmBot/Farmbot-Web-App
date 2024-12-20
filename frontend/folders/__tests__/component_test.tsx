jest.mock("../actions", () => ({
  updateSearchTerm: jest.fn(),
  toggleAll: jest.fn(),
  moveSequence: jest.fn(),
  dropSequence: jest.fn(() => jest.fn()),
  sequenceEditMaybeSave: jest.fn(),
  deleteFolder: jest.fn(),
  toggleFolderEditState: jest.fn(),
  createFolder: jest.fn(),
  addNewSequenceToFolder: jest.fn(),
  setFolderName: jest.fn(),
  toggleFolderOpenState: jest.fn(),
  setFolderColor: jest.fn(),
}));

jest.mock("@blueprintjs/core", () => ({
  Position: jest.fn(),
  PopoverInteractionKind: jest.fn(),
  Button: jest.fn(p => <button>{p.text}</button>),
  Classes: jest.fn(),
  MenuItem: jest.fn(),
  Alignment: jest.fn(),
}));

import { PopoverProps } from "../../ui/popover";
let mockPopover = ({ target, content }: PopoverProps) =>
  <div>{target}{content}</div>;
jest.mock("../../ui/popover", () => ({
  Popover: jest.fn((p: PopoverProps) => mockPopover(p)),
}));

jest.mock("@blueprintjs/select", () => ({
  Select: { ofType: jest.fn() },
  ItemRenderer: jest.fn(),
}));

jest.mock("../../sequences/actions", () => ({
  copySequence: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  Folders, FolderPanelTop, SequenceDropArea, FolderNameEditor,
  FolderButtonCluster, FolderListItem, FolderNameInput,
} from "../component";
import {
  FolderProps, FolderPanelTopProps, SequenceDropAreaProps, FolderNodeProps,
  FolderNodeInitial, FolderButtonClusterProps, FolderItemProps,
  FolderNameInputProps,
  FolderNodeMedial,
  FolderNodeTerminal,
} from "../interfaces";
import {
  updateSearchTerm, toggleAll, moveSequence, dropSequence,
  sequenceEditMaybeSave,
  deleteFolder,
  toggleFolderEditState,
  createFolder,
  addNewSequenceToFolder,
  setFolderName,
  toggleFolderOpenState,
  setFolderColor,
} from "../actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { SpecialStatus, Color, SequenceBodyItem } from "farmbot";
import { SearchField } from "../../ui/search_field";
import { Path } from "../../internal_urls";
import { copySequence } from "../../sequences/actions";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";

const fakeRootFolder = (): FolderNodeInitial => ({
  kind: "initial",
  children: [],
  id: 1,
  name: "my folder",
  content: [],
  color: "gray",
  open: true,
  editing: false,
});

const fakeFolderNode = (): FolderNodeMedial => {
  const folder = fakeRootFolder() as unknown as FolderNodeMedial;
  folder.kind = "medial";
  return folder;
};

const fakeTerminalFolder = (): FolderNodeTerminal => {
  const folder = fakeRootFolder() as unknown as FolderNodeTerminal;
  folder.children = undefined;
  folder.kind = "terminal";
  return folder;
};

describe("<Folders />", () => {
  const fakeProps = (): FolderProps => ({
    rootFolder: {
      folders: [],
      noFolder: [],
    },
    sequences: {},
    searchTerm: undefined,
    dispatch: jest.fn(),
    resourceUsage: {},
    sequenceMetas: {},
    getWebAppConfigValue: jest.fn(),
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    syncStatus: undefined,
  });

  it("renders empty state", () => {
    const p = fakeProps();
    const wrapper = mount<Folders>(<Folders {...p} />);
    expect(wrapper.text()).toContain("No Sequences.");
  });

  it("renders sequences outside of folders", () => {
    const p = fakeProps();
    p.rootFolder.folders[0] = fakeRootFolder();
    const sequence = fakeSequence();
    p.sequences = { [sequence.uuid]: sequence };
    sequence.body.name = "my sequence";
    p.rootFolder.noFolder = [sequence.uuid];
    const wrapper = mount<Folders>(<Folders {...p} />);
    expect(wrapper.text()).toContain("my sequence");
  });

  it("renders empty folder", () => {
    const p = fakeProps();
    p.rootFolder.folders[0] = fakeRootFolder();
    const wrapper = mount<Folders>(<Folders {...p} />);
    expect(wrapper.text()).toContain("my folder");
  });

  it("renders sequences in folder", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.name = "my sequence";
    p.sequences = { [sequence.uuid]: sequence };
    const folder = fakeRootFolder();
    folder.content = [sequence.uuid];
    p.rootFolder.folders[0] = folder;
    const wrapper = mount<Folders>(<Folders {...p} />);
    expect(wrapper.text()).toContain("my sequence");
  });

  it("renders folders in folder", () => {
    const p = fakeProps();
    const folder = fakeRootFolder();
    const childFolder = fakeFolderNode();
    childFolder.name = "deeper folder";
    folder.children = [childFolder];
    p.rootFolder.folders[0] = folder;
    const wrapper = mount<Folders>(<Folders {...p} />);
    expect(wrapper.text()).toContain("deeper folder");
  });

  it("renders terminal folder", () => {
    const p = fakeProps();
    const folder = fakeRootFolder();
    folder.name = "folder";
    const childFolder = fakeFolderNode();
    childFolder.name = "deeper folder";
    const terminalFolder = fakeTerminalFolder();
    terminalFolder.name = "deepest folder";
    childFolder.children = [terminalFolder];
    folder.children = [childFolder];
    p.rootFolder.folders[0] = folder;
    const wrapper = mount<Folders>(<Folders {...p} />);
    ["folder", "deeper folder", "deepest folder"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("toggles all folders", () => {
    const wrapper = mount<Folders>(<Folders {...fakeProps()} />);
    expect(wrapper.state().toggleDirection).toEqual(false);
    wrapper.instance().toggleAll();
    expect(toggleAll).toHaveBeenCalledWith(false);
    expect(wrapper.state().toggleDirection).toEqual(true);
  });

  it("starts sequence move", () => {
    const wrapper = mount<Folders>(<Folders {...fakeProps()} />);
    expect(wrapper.state().movedSequenceUuid).toEqual(undefined);
    wrapper.instance().startSequenceMove("fakeUuid");
    expect(wrapper.state().movedSequenceUuid).toEqual("fakeUuid");
    expect(wrapper.state().stashedUuid).toEqual(undefined);
  });

  const toggleMoveTest = (p: {
    prev: string | undefined,
    current: string | undefined,
    arg: string | undefined,
    new: string | undefined
  }) => {
    const wrapper = mount<Folders>(<Folders {...fakeProps()} />);
    wrapper.setState({ movedSequenceUuid: p.current, stashedUuid: p.prev });
    wrapper.instance().toggleSequenceMove(p.arg);
    expect(wrapper.state().movedSequenceUuid).toEqual(p.new);
  };

  it("toggle sequence move: on", () => {
    toggleMoveTest({
      prev: undefined, current: undefined, arg: "fakeUuid", new: "fakeUuid"
    });
    toggleMoveTest({
      prev: undefined, current: "oldFakeUuid", arg: "fakeUuid", new: "fakeUuid"
    });
  });

  it("toggle sequence move: off", () => {
    toggleMoveTest({
      prev: undefined, current: undefined, arg: undefined, new: undefined
    });
    toggleMoveTest({
      prev: "fakeUuid", current: "fakeUuid", arg: undefined, new: undefined
    });
    toggleMoveTest({
      prev: "fakeUuid", current: undefined, arg: "fakeUuid", new: undefined
    });
    toggleMoveTest({
      prev: "fakeUuid", current: "fakeUuid", arg: "fakeUuid", new: undefined
    });
  });

  it("ends sequence move", () => {
    const wrapper = mount<Folders>(<Folders {...fakeProps()} />);
    wrapper.setState({ movedSequenceUuid: "fakeUuid" });
    wrapper.instance().endSequenceMove(1);
    expect(moveSequence).toHaveBeenCalledWith("fakeUuid", 1);
    expect(wrapper.state().movedSequenceUuid).toEqual(undefined);
  });

  it("ends sequence move: undefined", () => {
    const wrapper = mount<Folders>(<Folders {...fakeProps()} />);
    wrapper.setState({ movedSequenceUuid: undefined });
    wrapper.instance().endSequenceMove(1);
    expect(moveSequence).toHaveBeenCalledWith("", 1);
    expect(wrapper.state().movedSequenceUuid).toEqual(undefined);
  });
});

describe("<FolderListItem />", () => {
  const fakeProps = (): FolderItemProps => ({
    startSequenceMove: jest.fn(),
    toggleSequenceMove: jest.fn(),
    sequence: fakeSequence(),
    movedSequenceUuid: undefined,
    dispatch: jest.fn(),
    variableData: undefined,
    inUse: false,
    getWebAppConfigValue: jest.fn(),
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    syncStatus: undefined,
    searchTerm: undefined,
  });

  beforeEach(() => {
    mockPopover = ({ target, content }: PopoverProps) =>
      <div>{target}{content}</div>;
  });

  it("renders", () => {
    const p = fakeProps();
    p.sequence.body.name = "my sequence";
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.text()).toContain("my sequence");
    expect(wrapper.find("li").hasClass("move-source")).toBeFalsy();
    expect(wrapper.find("li").hasClass("active")).toBeFalsy();
  });

  it("renders: matched", () => {
    const p = fakeProps();
    p.sequence.body.name = "my sequence";
    p.searchTerm = "sequence";
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".sequence-list-item").hasClass("matched")).toBeTruthy();
  });

  it("renders: move in progress", () => {
    const p = fakeProps();
    p.movedSequenceUuid = p.sequence.uuid;
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find("li").hasClass("move-source")).toBeTruthy();
  });

  it("renders: active", () => {
    const p = fakeProps();
    p.sequence.body.name = "sequence";
    location.pathname = Path.mock(Path.sequences("sequence"));
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find("li").hasClass("active")).toBeTruthy();
  });

  it("renders: unsaved", () => {
    const p = fakeProps();
    p.sequence.body.name = "my sequence";
    p.sequence.specialStatus = SpecialStatus.DIRTY;
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.text()).toContain("my sequence*");
  });

  it("renders: in use", () => {
    const p = fakeProps();
    p.inUse = true;
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".in-use").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: in use and has bad steps", () => {
    const p = fakeProps();
    p.inUse = true;
    p.sequence.body.body = [
      { kind: "resource_update", args: {} } as unknown as SequenceBodyItem,
    ];
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".in-use").length).toBeGreaterThanOrEqual(1);
    expect(wrapper.find(".fa-exclamation-triangle").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("renders: in use and pinned", () => {
    const p = fakeProps();
    p.inUse = true;
    p.sequence.body.pinned = true;
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".in-use").length).toBeGreaterThanOrEqual(1);
    expect(wrapper.find(".fa-thumb-tack").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: imported", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.forked = false;
    p.sequence.body.sequence_versions = [1];
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".fa-link").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: forked", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.forked = true;
    p.sequence.body.sequence_versions = [1];
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".fa-chain-broken").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: published", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = undefined;
    p.sequence.body.forked = false;
    p.sequence.body.sequence_versions = [1];
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.find(".fa-globe").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: no description", () => {
    const p = fakeProps();
    p.sequence.body.description = "";
    const wrapper = mount(<FolderListItem {...p} />);
    expect(wrapper.text().toLowerCase())
      .toContain("this sequence has no description");
  });

  it("opens pop-ups", () => {
    mockPopover = ({ target, content, isOpen }: PopoverProps) =>
      <div>{target}{isOpen ? content : ""}</div>;
    const wrapper = mount(<FolderListItem {...fakeProps()} />);
    expect(wrapper.find(".fa-copy").length).toEqual(0);
    expect(wrapper.text().toLowerCase()).not.toContain("description");
    wrapper.find(".fa-question-circle").simulate("click");
    wrapper.find(".fa-ellipsis-v").simulate("click");
    expect(wrapper.find(".fa-copy").length).toEqual(1);
    expect(wrapper.text().toLowerCase()).toContain("description");
  });

  it("changes color", () => {
    const p = fakeProps();
    p.sequence.body.id = undefined;
    p.sequence.body.name = "";
    p.sequence.body.color = "" as Color;
    const wrapper = shallow(<FolderListItem {...p} />);
    wrapper.find("ColorPicker").simulate("change", "green");
    expect(sequenceEditMaybeSave).toHaveBeenCalledWith(p.sequence, {
      color: "green"
    });
  });

  it("starts sequence move: drag start", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderListItem {...p} />);
    wrapper.simulate("dragStart", { dataTransfer: { setData: jest.fn() } });
    expect(p.startSequenceMove).toHaveBeenCalledWith(p.sequence.uuid);
  });

  it("starts sequence move: drag end", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderListItem {...p} />);
    wrapper.simulate("dragEnd");
    expect(p.toggleSequenceMove).toHaveBeenCalled();
  });

  it("starts sequence move", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderListItem {...p} />);
    wrapper.find(".fa-arrows-v").simulate("mouseDown");
    expect(p.startSequenceMove).toHaveBeenCalledWith(p.sequence.uuid);
  });

  it("toggles sequence move", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderListItem {...p} />);
    wrapper.find(".fa-arrows-v").simulate("mouseUp");
    expect(p.toggleSequenceMove).toHaveBeenCalledWith(p.sequence.uuid);
  });

  it("copies sequence", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderListItem {...p} />);
    wrapper.find(".fa-ellipsis-v").simulate("click");
    wrapper.find(".fa-copy").simulate("click");
    expect(copySequence).toHaveBeenCalledWith(expect.any(Function), p.sequence);
  });
});

describe("<FolderButtonCluster />", () => {
  const fakeProps = (): FolderButtonClusterProps => ({
    node: fakeRootFolder(),
    close: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<FolderButtonCluster {...fakeProps()} />);
    expect(wrapper.find(".fb-icon-button").length).toEqual(4);
  });

  it("deletes folder", () => {
    const p = fakeProps();
    p.node.id = 1;
    const wrapper = mount(<FolderButtonCluster {...p} />);
    wrapper.find(".fb-icon-button").at(0).simulate("click");
    expect(deleteFolder).toHaveBeenCalledWith(1);
  });

  it("edits folder", () => {
    const p = fakeProps();
    p.node.id = 1;
    const wrapper = mount(<FolderButtonCluster {...p} />);
    wrapper.find(".fb-icon-button").at(1).simulate("click");
    expect(p.close).toHaveBeenCalled();
    expect(toggleFolderEditState).toHaveBeenCalledWith(1);
  });

  it("creates new folder", () => {
    const p = fakeProps();
    p.node.id = 1;
    const wrapper = mount(<FolderButtonCluster {...p} />);
    wrapper.find(".fb-icon-button").at(2).simulate("click");
    expect(p.close).toHaveBeenCalled();
    expect(createFolder).toHaveBeenCalledWith({
      parent_id: p.node.id,
      color: "gray",
    });
  });

  it("creates new sequence", () => {
    const p = fakeProps();
    p.node.id = 1;
    const wrapper = mount(<FolderButtonCluster {...p} />);
    wrapper.find(".fb-icon-button").at(3).simulate("click");
    expect(p.close).toHaveBeenCalled();
    expect(addNewSequenceToFolder).toHaveBeenCalledWith(expect.any(Function), {
      id: 1,
      color: "gray",
    });
  });
});

describe("<FolderNameInput />", () => {
  const fakeProps = (): FolderNameInputProps => ({
    node: fakeFolderNode(),
  });

  it("edits folder name", () => {
    const p = fakeProps();
    p.node.editing = true;
    const wrapper = shallow(<FolderNameInput {...p} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(setFolderName).toHaveBeenCalledWith(p.node.id, "new name");
    expect(toggleFolderEditState).toHaveBeenCalledWith(p.node.id);
  });

  it("closes folder name input", () => {
    const p = fakeProps();
    p.node.editing = true;
    const wrapper = shallow(<FolderNameInput {...p} />);
    wrapper.find("button").simulate("click");
    expect(toggleFolderEditState).toHaveBeenCalledWith(p.node.id);
  });
});

describe("<FolderNameEditor />", () => {
  const fakeProps = (): FolderNodeProps => ({
    node: fakeRootFolder(),
    sequences: {},
    movedSequenceUuid: undefined,
    startSequenceMove: jest.fn(),
    toggleSequenceMove: jest.fn(),
    onMoveEnd: jest.fn(),
    dispatch: jest.fn(),
    resourceUsage: {},
    sequenceMetas: {},
    getWebAppConfigValue: jest.fn(),
    resources: buildResourceIndex([]).index,
    menuOpen: fakeMenuOpenState(),
    syncStatus: undefined,
    searchTerm: undefined,
    dragging: false,
  });

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.text()).toContain("my folder");
    expect(wrapper.find(".fa-ellipsis-v").hasClass("open")).toBeFalsy();
    expect(wrapper.find(".fa-chevron-down").length).toEqual(1);
    expect(wrapper.find(".fa-chevron-right").length).toEqual(0);
    expect(wrapper.find(".folder-name-input").length).toEqual(0);
  });

  it("renders: matched", () => {
    const p = fakeProps();
    p.node.name = "my folder";
    p.searchTerm = "folder";
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".folder-list-item").hasClass("matched")).toBeTruthy();
  });

  it("opens settings menu", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".fa-ellipsis-v").hasClass("open")).toBeFalsy();
    wrapper.find(".fa-ellipsis-v").simulate("click");
    expect(wrapper.find(".fa-ellipsis-v").hasClass("open")).toBeTruthy();
  });

  it("hovers", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".folder-list-item").hasClass("hovered")).toBeFalsy();
    wrapper.find(".folder-list-item").simulate("dragEnter");
    expect(wrapper.find(".folder-list-item").hasClass("hovered")).toBeTruthy();
    wrapper.find(".folder-list-item").simulate("dragLeave");
    expect(wrapper.find(".folder-list-item").hasClass("hovered")).toBeFalsy();
    wrapper.find(".folder-list-item").simulate("dragOver");
    wrapper.find(".folder-list-item").simulate("dragEnter");
    expect(wrapper.find(".folder-list-item").hasClass("hovered")).toBeTruthy();
    wrapper.find(".folder-list-item").simulate("drop");
    expect(wrapper.find(".folder-list-item").hasClass("hovered")).toBeFalsy();
  });

  it("renders: moving", () => {
    const p = fakeProps();
    p.movedSequenceUuid = "fake";
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".folder-list-item").hasClass("moving")).toBeTruthy();
  });

  it("renders: dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".folder-list-item").hasClass("not-dragging")).toBeFalsy();
  });

  it("renders: folder closed", () => {
    const p = fakeProps();
    p.node.open = false;
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".fa-chevron-down").length).toEqual(0);
    expect(wrapper.find(".fa-chevron-right").length).toEqual(1);
  });

  it("renders: editing", () => {
    const p = fakeProps();
    p.node.editing = true;
    const wrapper = mount(<FolderNameEditor {...p} />);
    expect(wrapper.find(".folder-name-input").length).toEqual(1);
  });

  it("closes folder", () => {
    const p = fakeProps();
    p.node.open = true;
    const wrapper = mount(<FolderNameEditor {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(toggleFolderOpenState).toHaveBeenCalledWith(p.node.id);
  });

  it("changes folder color", () => {
    const p = fakeProps();
    const wrapper = shallow(<FolderNameEditor {...p} />);
    wrapper.find("ColorPicker").simulate("change", "green");
    expect(setFolderColor).toHaveBeenCalledWith(p.node.id, "green");
  });

  it("closes settings menu", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderNameEditor {...p} />);
    wrapper.find(".fa-ellipsis-v").simulate("click");
    expect(wrapper.find(".fa-ellipsis-v").hasClass("open")).toBeTruthy();
    wrapper.find(".fb-icon-button").last().simulate("click");
    expect(wrapper.find(".fa-ellipsis-v").hasClass("open")).toBeFalsy();
  });
});

describe("<SequenceDropArea />", () => {
  const fakeProps = (): SequenceDropAreaProps => ({
    dropAreaVisible: true,
    onMoveEnd: jest.fn(),
    toggleSequenceMove: jest.fn(),
    folderId: 1,
    folderName: "my folder",
  });

  it("shows drop area", () => {
    const p = fakeProps();
    p.dropAreaVisible = true;
    const wrapper = mount(<SequenceDropArea {...p} />);
    expect(wrapper.find(".folder-drop-area").hasClass("visible")).toBeTruthy();
    expect(wrapper.text().toLowerCase()).toContain("move into my folder");
  });

  it("hides drop area", () => {
    const p = fakeProps();
    p.dropAreaVisible = false;
    const wrapper = mount(<SequenceDropArea {...p} />);
    expect(wrapper.find(".folder-drop-area").hasClass("visible")).toBeFalsy();
  });

  it("has 'remove from folders' text", () => {
    const p = fakeProps();
    p.dropAreaVisible = true;
    p.folderId = 0;
    const wrapper = mount(<SequenceDropArea {...p} />);
    expect(wrapper.find(".folder-drop-area").hasClass("visible")).toBeTruthy();
    expect(wrapper.text()).not.toContain("my folder");
    expect(wrapper.text().toLowerCase()).toContain("move out of folders");
  });

  it("handles click", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequenceDropArea {...p} />);
    wrapper.find(".folder-drop-area").simulate("click");
    expect(p.onMoveEnd).toHaveBeenCalledWith(p.folderId);
  });

  it("handles drop", () => {
    const p = fakeProps();
    const wrapper = shallow<SequenceDropArea>(<SequenceDropArea {...p} />);
    wrapper.setState({ hovered: true });
    expect(wrapper.find(".folder-drop-area").hasClass("hovered")).toBeTruthy();
    wrapper.find(".folder-drop-area").simulate("drop");
    expect(wrapper.state().hovered).toBeFalsy();
    expect(dropSequence).toHaveBeenCalledWith(p.folderId);
    expect(p.toggleSequenceMove).toHaveBeenCalled();
  });

  it("handles drag over", () => {
    const p = fakeProps();
    const wrapper = shallow(<SequenceDropArea {...p} />);
    const e = { preventDefault: jest.fn() };
    wrapper.find(".folder-drop-area").simulate("dragOver", e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("handles drag enter", () => {
    const p = fakeProps();
    const wrapper = shallow<SequenceDropArea>(<SequenceDropArea {...p} />);
    wrapper.find(".folder-drop-area").simulate("dragEnter");
    expect(wrapper.state().hovered).toBeTruthy();
  });

  it("handles drag leave", () => {
    const p = fakeProps();
    const wrapper = shallow<SequenceDropArea>(<SequenceDropArea {...p} />);
    wrapper.find(".folder-drop-area").simulate("dragLeave");
    expect(wrapper.state().hovered).toBeFalsy();
  });
});

describe("<FolderPanelTop />", () => {
  const fakeProps = (): FolderPanelTopProps => ({
    searchTerm: "",
    toggleDirection: true,
    toggleAll: jest.fn(),
  });

  it("changes search term", () => {
    const p = fakeProps();
    const wrapper = shallow(<FolderPanelTop {...p} />);
    wrapper.find(SearchField).simulate("change", "new");
    expect(updateSearchTerm).toHaveBeenCalledWith("new");
  });

  it("creates new folder", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderPanelTop {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(createFolder).toHaveBeenCalled();
  });

  it("creates new sequence", () => {
    const p = fakeProps();
    const wrapper = mount(<FolderPanelTop {...p} />);
    wrapper.find("button").at(2).simulate("click");
    expect(addNewSequenceToFolder).toHaveBeenCalled();
  });
});
