/* eslint-disable @typescript-eslint/no-explicit-any */
import * as popover from "../../ui/popover";
const defaultMockPopover = ({ target, content }: popover.PopoverProps) =>
  <div>{target}{content}</div>;
let mockPopover = defaultMockPopover;

import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";
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
import * as folderActions from "../actions";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { SpecialStatus, Color, SequenceBodyItem } from "farmbot";
import { Path } from "../../internal_urls";
import * as sequenceActions from "../../sequences/actions";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";
import { changeBlurableInput } from "../../__test_support__/helpers";
import * as blueprintCore from "@blueprintjs/core";

let copySequenceSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;
let buttonSpy: jest.SpyInstance;
let updateSearchTermSpy: jest.SpyInstance;
let toggleAllSpy: jest.SpyInstance;
let moveSequenceSpy: jest.SpyInstance;
let dropSequenceSpy: jest.SpyInstance;
let sequenceEditMaybeSaveSpy: jest.SpyInstance;
let deleteFolderSpy: jest.SpyInstance;
let toggleFolderEditStateSpy: jest.SpyInstance;
let createFolderSpy: jest.SpyInstance;
let addNewSequenceToFolderSpy: jest.SpyInstance;
let setFolderNameSpy: jest.SpyInstance;
let toggleFolderOpenStateSpy: jest.SpyInstance;
let setFolderColorSpy: jest.SpyInstance;

beforeEach(() => {
  mockPopover = defaultMockPopover;
  popoverSpy = jest.spyOn(popover, "Popover")
    .mockImplementation((p: popover.PopoverProps) => mockPopover(p));
  buttonSpy = jest.spyOn(blueprintCore, "Button")
    .mockImplementation((p: blueprintCore.ButtonProps) => <button>{p.text}</button>);
  copySequenceSpy = jest.spyOn(sequenceActions, "copySequence")
    .mockImplementation(jest.fn());
  updateSearchTermSpy = jest.spyOn(folderActions, "updateSearchTerm")
    .mockImplementation(jest.fn());
  toggleAllSpy = jest.spyOn(folderActions, "toggleAll")
    .mockImplementation(jest.fn());
  moveSequenceSpy = jest.spyOn(folderActions, "moveSequence")
    .mockImplementation(jest.fn());
  dropSequenceSpy = jest.spyOn(folderActions, "dropSequence")
    .mockImplementation(() => jest.fn());
  sequenceEditMaybeSaveSpy =
    jest.spyOn(folderActions, "sequenceEditMaybeSave")
      .mockImplementation(jest.fn());
  deleteFolderSpy = jest.spyOn(folderActions, "deleteFolder")
    .mockImplementation(jest.fn());
  toggleFolderEditStateSpy =
    jest.spyOn(folderActions, "toggleFolderEditState")
      .mockImplementation(jest.fn());
  createFolderSpy = jest.spyOn(folderActions, "createFolder")
    .mockImplementation(jest.fn());
  addNewSequenceToFolderSpy =
    jest.spyOn(folderActions, "addNewSequenceToFolder")
      .mockImplementation(jest.fn());
  setFolderNameSpy = jest.spyOn(folderActions, "setFolderName")
    .mockImplementation(jest.fn());
  toggleFolderOpenStateSpy =
    jest.spyOn(folderActions, "toggleFolderOpenState")
      .mockImplementation(jest.fn());
  setFolderColorSpy = jest.spyOn(folderActions, "setFolderColor")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  popoverSpy.mockRestore();
  buttonSpy.mockRestore();
  copySequenceSpy.mockRestore();
  updateSearchTermSpy.mockRestore();
  toggleAllSpy.mockRestore();
  moveSequenceSpy.mockRestore();
  dropSequenceSpy.mockRestore();
  sequenceEditMaybeSaveSpy.mockRestore();
  deleteFolderSpy.mockRestore();
  toggleFolderEditStateSpy.mockRestore();
  createFolderSpy.mockRestore();
  addNewSequenceToFolderSpy.mockRestore();
  setFolderNameSpy.mockRestore();
  toggleFolderOpenStateSpy.mockRestore();
  setFolderColorSpy.mockRestore();
});

afterAll(() => {
});

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

const setStateSync = <T extends {
  state: unknown;
  props: unknown;
  setState: unknown;
}>(instance: T): T => {
  instance.setState = ((state: unknown, callback?: () => void) => {
    const update = typeof state == "function"
      ? (state as (prev: unknown, props: unknown) => unknown)(
        instance.state, instance.props)
      : state;
    instance.state = {
      ...(instance.state as Record<string, unknown>),
      ...(update as Record<string, unknown>),
    };
    callback?.();
  });
  return instance;
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
    const { container } = render(<Folders {...p} />);
    expect(container.textContent).toContain("No Sequences.");
  });

  it("renders sequences outside of folders", () => {
    const p = fakeProps();
    p.rootFolder.folders[0] = fakeRootFolder();
    const sequence = fakeSequence();
    p.sequences = { [sequence.uuid]: sequence };
    sequence.body.name = "my sequence";
    p.rootFolder.noFolder = [sequence.uuid];
    const { container } = render(<Folders {...p} />);
    expect(container.textContent).toContain("my sequence");
  });

  it("renders empty folder", () => {
    const p = fakeProps();
    p.rootFolder.folders[0] = fakeRootFolder();
    const { container } = render(<Folders {...p} />);
    expect(container.textContent).toContain("my folder");
  });

  it("renders sequences in folder", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.name = "my sequence";
    p.sequences = { [sequence.uuid]: sequence };
    const folder = fakeRootFolder();
    folder.content = [sequence.uuid];
    p.rootFolder.folders[0] = folder;
    const { container } = render(<Folders {...p} />);
    expect(container.textContent).toContain("my sequence");
  });

  it("renders folders in folder", () => {
    const p = fakeProps();
    const folder = fakeRootFolder();
    const childFolder = fakeFolderNode();
    childFolder.name = "deeper folder";
    folder.children = [childFolder];
    p.rootFolder.folders[0] = folder;
    const { container } = render(<Folders {...p} />);
    expect(container.textContent).toContain("deeper folder");
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
    const { container } = render(<Folders {...p} />);
    ["folder", "deeper folder", "deepest folder"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("toggles all folders", () => {
    const instance = setStateSync(new Folders(fakeProps()));
    expect(instance.state.toggleDirection).toEqual(false);
    instance.toggleAll();
    expect(toggleAll).toHaveBeenCalledWith(false);
    expect(instance.state.toggleDirection).toEqual(true);
  });

  it("starts sequence move", () => {
    const instance = setStateSync(new Folders(fakeProps()));
    expect(instance.state.movedSequenceUuid).toEqual(undefined);
    instance.startSequenceMove("fakeUuid");
    expect(instance.state.movedSequenceUuid).toEqual("fakeUuid");
    expect(instance.state.stashedUuid).toEqual(undefined);
  });

  const toggleMoveTest = (p: {
    prev: string | undefined,
    current: string | undefined,
    arg: string | undefined,
    new: string | undefined
  }) => {
    const instance = setStateSync(new Folders(fakeProps()));
    instance.setState({ movedSequenceUuid: p.current, stashedUuid: p.prev });
    instance.toggleSequenceMove(p.arg);
    expect(instance.state.movedSequenceUuid).toEqual(p.new);
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
    const instance = setStateSync(new Folders(fakeProps()));
    instance.setState({ movedSequenceUuid: "fakeUuid" });
    instance.endSequenceMove(1);
    expect(moveSequence).toHaveBeenCalledWith("fakeUuid", 1);
    expect(instance.state.movedSequenceUuid).toEqual(undefined);
  });

  it("ends sequence move: undefined", () => {
    const instance = setStateSync(new Folders(fakeProps()));
    instance.setState({ movedSequenceUuid: undefined });
    instance.endSequenceMove(1);
    expect(moveSequence).toHaveBeenCalledWith("", 1);
    expect(instance.state.movedSequenceUuid).toEqual(undefined);
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
    mockPopover = ({ target, content }: popover.PopoverProps) =>
      <div>{target}{content}</div>;
  });

  it("renders", () => {
    const p = fakeProps();
    p.sequence.body.name = "my sequence";
    const { container } = render(<FolderListItem {...p} />);
    expect(container.textContent).toContain("my sequence");
    expect(container.querySelector("li")?.classList.contains("move-source"))
      .toBeFalsy();
    expect(container.querySelector("li")?.classList.contains("active"))
      .toBeFalsy();
  });

  it("renders: matched", () => {
    const p = fakeProps();
    p.sequence.body.name = "my sequence";
    p.searchTerm = "sequence";
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelector(".sequence-list-item")
      ?.classList.contains("matched")).toBeTruthy();
  });

  it("renders: move in progress", () => {
    const p = fakeProps();
    p.movedSequenceUuid = p.sequence.uuid;
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelector("li")?.classList.contains("move-source"))
      .toBeTruthy();
  });

  it("renders: active", () => {
    const p = fakeProps();
    p.sequence.body.name = "sequence";
    location.pathname = Path.mock(Path.sequences("sequence"));
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelector("li")?.classList.contains("active"))
      .toBeTruthy();
  });

  it("renders: unsaved", () => {
    const p = fakeProps();
    p.sequence.body.name = "my sequence";
    p.sequence.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<FolderListItem {...p} />);
    expect(container.textContent).toContain("my sequence*");
  });

  it("renders: in use", () => {
    const p = fakeProps();
    p.inUse = true;
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelectorAll(".in-use").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("renders: in use and has bad steps", () => {
    const p = fakeProps();
    p.inUse = true;
    p.sequence.body.body = [
      { kind: "resource_update", args: {} } as unknown as SequenceBodyItem,
    ];
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelectorAll(".in-use").length)
      .toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".fa-exclamation-triangle").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("renders: in use and pinned", () => {
    const p = fakeProps();
    p.inUse = true;
    p.sequence.body.pinned = true;
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelectorAll(".in-use").length)
      .toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".fa-thumb-tack").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("renders: imported", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.forked = false;
    p.sequence.body.sequence_versions = [1];
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelectorAll(".fa-link").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: forked", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.forked = true;
    p.sequence.body.sequence_versions = [1];
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelectorAll(".fa-chain-broken").length)
      .toBeGreaterThanOrEqual(1);
  });

  it("renders: published", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = undefined;
    p.sequence.body.forked = false;
    p.sequence.body.sequence_versions = [1];
    const { container } = render(<FolderListItem {...p} />);
    expect(container.querySelectorAll(".fa-globe").length).toBeGreaterThanOrEqual(1);
  });

  it("renders: no description", () => {
    const p = fakeProps();
    p.sequence.body.description = "";
    const { container } = render(<FolderListItem {...p} />);
    expect(container.textContent?.toLowerCase())
      .toContain("this sequence has no description");
  });

  it("opens pop-ups", () => {
    mockPopover = ({ target, content, isOpen }: any) =>
      <div>{target}{isOpen ? content : ""}</div>;
    const { container } = render(<FolderListItem {...fakeProps()} />);
    expect(container.querySelectorAll(".fa-copy").length).toEqual(0);
    expect(container.textContent?.toLowerCase()).not.toContain("description");
    fireEvent.click(container.querySelector(".fa-question-circle") as Element);
    fireEvent.click(container.querySelector(".fa-ellipsis-v") as Element);
    expect(container.querySelectorAll(".fa-copy").length).toEqual(1);
    expect(container.textContent?.toLowerCase()).toContain("description");
  });

  it("changes color", () => {
    const p = fakeProps();
    p.sequence.body.id = undefined;
    p.sequence.body.name = "";
    p.sequence.body.color = "" as Color;
    const wrapper = createRenderer(
      <FolderListItem {...p} />,
      "Failed to create FolderListItem test wrapper.",
    );
    const colorPicker = wrapper.root.find(node =>
      node.props.current === p.sequence.body.color
      && typeof node.props.onChange == "function");
    actRenderer(() => {
      colorPicker.props.onChange("green");
    });
    expect(sequenceEditMaybeSave).toHaveBeenCalledWith(p.sequence, { color: "green" });
    unmountRenderer(wrapper);
  });

  it("starts sequence move: drag start", () => {
    const p = fakeProps();
    const { container } = render(<FolderListItem {...p} />);
    fireEvent.dragStart(container.querySelector(".step-dragger") as Element, {
      dataTransfer: { setData: jest.fn() },
    });
    expect(p.startSequenceMove).toHaveBeenCalledWith(p.sequence.uuid);
  });

  it("starts sequence move: drag end", () => {
    const p = fakeProps();
    const { container } = render(<FolderListItem {...p} />);
    fireEvent.dragEnd(container.querySelector(".step-dragger") as Element);
    expect(p.toggleSequenceMove).toHaveBeenCalled();
  });

  it("starts sequence move", () => {
    const p = fakeProps();
    const { container } = render(<FolderListItem {...p} />);
    fireEvent.mouseDown(container.querySelector(".fa-arrows-v") as Element);
    expect(p.startSequenceMove).toHaveBeenCalledWith(p.sequence.uuid);
  });

  it("toggles sequence move", () => {
    const p = fakeProps();
    const { container } = render(<FolderListItem {...p} />);
    fireEvent.mouseUp(container.querySelector(".fa-arrows-v") as Element);
    expect(p.toggleSequenceMove).toHaveBeenCalledWith(p.sequence.uuid);
  });

  it("copies sequence", () => {
    const p = fakeProps();
    const { container } = render(<FolderListItem {...p} />);
    fireEvent.click(container.querySelector(".fa-ellipsis-v") as Element);
    fireEvent.click(container.querySelector(".fa-copy") as Element);
    expect(sequenceActions.copySequence)
      .toHaveBeenCalledWith(expect.any(Function), p.sequence);
  });
});

describe("<FolderButtonCluster />", () => {
  const fakeProps = (): FolderButtonClusterProps => ({
    node: fakeRootFolder(),
    close: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<FolderButtonCluster {...fakeProps()} />);
    expect(container.querySelectorAll(".fb-icon-button").length).toEqual(4);
  });

  it("deletes folder", () => {
    const p = fakeProps();
    p.node.id = 1;
    const { container } = render(<FolderButtonCluster {...p} />);
    fireEvent.click(container.querySelectorAll(".fb-icon-button")[0]);
    expect(deleteFolder).toHaveBeenCalledWith(1);
  });

  it("edits folder", () => {
    const p = fakeProps();
    p.node.id = 1;
    const { container } = render(<FolderButtonCluster {...p} />);
    fireEvent.click(container.querySelectorAll(".fb-icon-button")[1]);
    expect(p.close).toHaveBeenCalled();
    expect(toggleFolderEditState).toHaveBeenCalledWith(1);
  });

  it("creates new folder", () => {
    const p = fakeProps();
    p.node.id = 1;
    const { container } = render(<FolderButtonCluster {...p} />);
    fireEvent.click(container.querySelectorAll(".fb-icon-button")[2]);
    expect(p.close).toHaveBeenCalled();
    expect(createFolder).toHaveBeenCalledWith({
      parent_id: p.node.id,
      color: "gray",
    });
  });

  it("creates new sequence", () => {
    const p = fakeProps();
    p.node.id = 1;
    const { container } = render(<FolderButtonCluster {...p} />);
    fireEvent.click(container.querySelectorAll(".fb-icon-button")[3]);
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
    const view = render(<FolderNameInput {...p} />);
    changeBlurableInput(view, "new name");
    expect(setFolderName).toHaveBeenCalledWith(p.node.id, "new name");
    expect(toggleFolderEditState).toHaveBeenCalledWith(p.node.id);
  });

  it("closes folder name input", () => {
    const p = fakeProps();
    p.node.editing = true;
    const { container } = render(<FolderNameInput {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
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
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.textContent).toContain("my folder");
    expect(container.querySelector(".fa-ellipsis-v")
      ?.classList.contains("open")).toBeFalsy();
    expect(container.querySelectorAll(".fa-chevron-down").length).toEqual(1);
    expect(container.querySelectorAll(".fa-chevron-right").length).toEqual(0);
    expect(container.querySelectorAll(".folder-name-input").length).toEqual(0);
  });

  it("renders: matched", () => {
    const p = fakeProps();
    p.node.name = "my folder";
    p.searchTerm = "folder";
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.querySelector(".folder-list-item")
      ?.classList.contains("matched")).toBeTruthy();
  });

  it("opens settings menu", () => {
    const p = fakeProps();
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.querySelector(".fa-ellipsis-v")
      ?.classList.contains("open")).toBeFalsy();
    fireEvent.click(container.querySelector(".fa-ellipsis-v") as Element);
    expect(container.querySelector(".fa-ellipsis-v")
      ?.classList.contains("open")).toBeTruthy();
  });

  it("hovers", () => {
    const p = fakeProps();
    const { container } = render(<FolderNameEditor {...p} />);
    const item = container.querySelector(".folder-list-item") as Element;
    expect(item.classList.contains("hovered")).toBeFalsy();
    fireEvent.dragEnter(item);
    expect(item.classList.contains("hovered")).toBeTruthy();
    fireEvent.dragLeave(item);
    expect(item.classList.contains("hovered")).toBeFalsy();
    fireEvent.dragOver(item);
    fireEvent.dragEnter(item);
    expect(item.classList.contains("hovered")).toBeTruthy();
    fireEvent.drop(item);
    expect(item.classList.contains("hovered")).toBeFalsy();
  });

  it("renders: moving", () => {
    const p = fakeProps();
    p.movedSequenceUuid = "fake";
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.querySelector(".folder-list-item")
      ?.classList.contains("moving")).toBeTruthy();
  });

  it("renders: dragging", () => {
    const p = fakeProps();
    p.dragging = true;
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.querySelector(".folder-list-item")
      ?.classList.contains("not-dragging")).toBeFalsy();
  });

  it("renders: folder closed", () => {
    const p = fakeProps();
    p.node.open = false;
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.querySelectorAll(".fa-chevron-down").length).toEqual(0);
    expect(container.querySelectorAll(".fa-chevron-right").length).toEqual(1);
  });

  it("renders: editing", () => {
    const p = fakeProps();
    p.node.editing = true;
    const { container } = render(<FolderNameEditor {...p} />);
    expect(container.querySelectorAll(".folder-name-input").length).toEqual(1);
  });

  it("closes folder", () => {
    const p = fakeProps();
    p.node.open = true;
    const { container } = render(<FolderNameEditor {...p} />);
    fireEvent.click(container.querySelector(".fa-chevron-down") as Element);
    expect(toggleFolderOpenState).toHaveBeenCalledWith(p.node.id);
  });

  it("changes folder color", async () => {
    const p = fakeProps();
    const { container } = render(<FolderNameEditor {...p} />);
    const openColorPicker = container.querySelector(".saucer")
      || container.querySelector("[title=\"select color\"]");
    openColorPicker && fireEvent.click(openColorPicker);
    const colorButton = await waitFor(() => {
      const button = document.querySelector("[title=\"green\"]")
        || document.querySelector(".color-picker-mock")
        || document.querySelector(".mock-color-picker");
      if (!button) { throw new Error("Color picker option not found"); }
      return button;
    });
    fireEvent.click(colorButton);
    let color: string | ReturnType<typeof expect.stringMatching> = "green";
    if (colorButton.classList.contains("color-picker-mock")) {
      color = "blue";
    } else if (colorButton.classList.contains("mock-color-picker")) {
      color = expect.stringMatching(/^(blue|green)$/);
    }
    expect(setFolderColor).toHaveBeenCalledWith(p.node.id, color);
  });

  it("closes settings menu", () => {
    const p = fakeProps();
    const { container } = render(<FolderNameEditor {...p} />);
    fireEvent.click(container.querySelector(".fa-ellipsis-v") as Element);
    expect(container.querySelector(".fa-ellipsis-v")
      ?.classList.contains("open")).toBeTruthy();
    const buttons = container.querySelectorAll(".fb-icon-button");
    fireEvent.click(buttons[buttons.length - 1]);
    expect(container.querySelector(".fa-ellipsis-v")
      ?.classList.contains("open")).toBeFalsy();
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
    const { container } = render(<SequenceDropArea {...p} />);
    const dropArea = container.querySelector(".folder-drop-area") as Element;
    expect(dropArea.classList.contains("visible")).toBeTruthy();
    expect(container.textContent?.toLowerCase()).toContain("move into my folder");
  });

  it("hides drop area", () => {
    const p = fakeProps();
    p.dropAreaVisible = false;
    const { container } = render(<SequenceDropArea {...p} />);
    const dropArea = container.querySelector(".folder-drop-area") as Element;
    expect(dropArea.classList.contains("visible")).toBeFalsy();
  });

  it("has 'remove from folders' text", () => {
    const p = fakeProps();
    p.dropAreaVisible = true;
    p.folderId = 0;
    const { container } = render(<SequenceDropArea {...p} />);
    const dropArea = container.querySelector(".folder-drop-area") as Element;
    expect(dropArea.classList.contains("visible")).toBeTruthy();
    expect(container.textContent).not.toContain("my folder");
    expect(container.textContent?.toLowerCase()).toContain("move out of folders");
  });

  it("handles click", () => {
    const p = fakeProps();
    const { container } = render(<SequenceDropArea {...p} />);
    fireEvent.click(container.querySelector(".folder-drop-area") as Element);
    expect(p.onMoveEnd).toHaveBeenCalledWith(p.folderId);
  });

  it("handles drop", () => {
    const p = fakeProps();
    const { container } = render(<SequenceDropArea {...p} />);
    const dropArea = container.querySelector(".folder-drop-area") as Element;
    fireEvent.dragEnter(dropArea);
    expect(dropArea.classList.contains("hovered")).toBeTruthy();
    fireEvent.drop(dropArea);
    expect(dropArea.classList.contains("hovered")).toBeFalsy();
    expect(dropSequence).toHaveBeenCalledWith(p.folderId);
    expect(p.toggleSequenceMove).toHaveBeenCalled();
  });

  it("handles drag over", () => {
    const p = fakeProps();
    const instance = setStateSync(new SequenceDropArea(p));
    const rendered = instance.render() as React.ReactElement<{
      onDragOver: (e: { preventDefault: () => void }) => void;
    }>;
    const e = { preventDefault: jest.fn() };
    rendered.props.onDragOver(e);
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("handles drag enter", () => {
    const p = fakeProps();
    const { container } = render(<SequenceDropArea {...p} />);
    const dropArea = container.querySelector(".folder-drop-area") as Element;
    fireEvent.dragEnter(dropArea);
    expect(dropArea.classList.contains("hovered")).toBeTruthy();
  });

  it("handles drag leave", () => {
    const p = fakeProps();
    const { container } = render(<SequenceDropArea {...p} />);
    const dropArea = container.querySelector(".folder-drop-area") as Element;
    fireEvent.dragEnter(dropArea);
    fireEvent.dragLeave(dropArea);
    expect(dropArea.classList.contains("hovered")).toBeFalsy();
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
    const { container } = render(<FolderPanelTop {...p} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "new" },
      currentTarget: { value: "new" },
    });
    expect(updateSearchTerm).toHaveBeenCalledWith("new");
  });

  it("creates new folder", () => {
    const p = fakeProps();
    const { container } = render(<FolderPanelTop {...p} />);
    fireEvent.click(container.querySelectorAll("button")[1]);
    expect(createFolder).toHaveBeenCalled();
  });

  it("creates new sequence", () => {
    const p = fakeProps();
    const { container } = render(<FolderPanelTop {...p} />);
    fireEvent.click(container.querySelectorAll("button")[2]);
    expect(addNewSequenceToFolder).toHaveBeenCalled();
  });
});
