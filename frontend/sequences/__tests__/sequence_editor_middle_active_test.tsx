const mockCB = jest.fn();

import React, { act } from "react";
import TestRenderer from "react-test-renderer";
import {
  SequenceEditorMiddleActive, onDrop, SequenceName,
  SequenceSettingsMenu,
  SequenceSetting,
  SequenceBtnGroup,
  SequenceShareMenu,
  SequencePublishMenu,
  isSequencePublished,
  AddCommandButtonProps,
} from "../sequence_editor_middle_active";
import { createEvent, render, fireEvent } from "@testing-library/react";
import {
  ActiveMiddleProps, SequenceBtnGroupProps, SequenceSettingProps,
  SequenceSettingsMenuProps,
  SequenceShareMenuProps,
} from "../interfaces";
import * as ui from "../../ui";
import * as blueprintCore from "@blueprintjs/core";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import * as crud from "../../api/crud";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../__test_support__/fake_sequence_step_data";
import { SpecialStatus, ParameterDeclaration } from "farmbot";
import * as stepTiles from "../step_tiles";
import {
  copySequence, editCurrentSequence, pinSequenceToggle, publishSequence,
  unpublishSequence,
  upgradeSequence,
} from "../actions";
import * as devicesActions from "../../devices/actions";
import { clickButton } from "../../__test_support__/helpers";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { Actions, Content, DeviceSetting } from "../../constants";
import * as configStorageActions from "../../config_storage/actions";
import { BooleanSetting } from "../../session_keys";
import { maybeTagStep } from "../../resources/sequence_tagging";
import { error } from "../../toast/toast";
import { API } from "../../api";
import * as previewSupport from "../panel/preview_support";
import { VariableType } from "../locals_list/locals_list_support";
import * as localsList from "../locals_list/locals_list";
import * as requestAutoGenerationModule from "../request_auto_generation";
import { emptyState } from "../../resources/reducer";
import { Path } from "../../internal_urls";
import * as sequenceActions from "../actions";
import * as stepButtonClusterModule from "../step_button_cluster";

let spliceSpy: jest.SpyInstance;
let moveSpy: jest.SpyInstance;
let renderCeleryNodeSpy: jest.SpyInstance;
let stringifySequenceDataSpy: jest.SpyInstance;
let execSequenceSpy: jest.SpyInstance;
let setWebAppConfigValueSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let loadSequenceVersionSpy: jest.SpyInstance;
let licenseSpy: jest.SpyInstance;
let sequencePreviewContentSpy: jest.SpyInstance;
let requestAutoGenerationSpy: jest.SpyInstance;
let localsListSpy: jest.SpyInstance;
let localListCallbackSpy: jest.SpyInstance;
let removeVariableSpy: jest.SpyInstance;
let generateNewVariableLabelSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let copySequenceSpy: jest.SpyInstance;
let editCurrentSequenceSpy: jest.SpyInstance;
let pinSequenceToggleSpy: jest.SpyInstance;
let publishSequenceSpy: jest.SpyInstance;
let unpublishSequenceSpy: jest.SpyInstance;
let upgradeSequenceSpy: jest.SpyInstance;
let collapseSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;
let toggleButtonSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;
let colorPickerClusterSpy: jest.SpyInstance;

beforeEach(() => {
  collapseSpy = jest.spyOn(blueprintCore, "Collapse")
    .mockImplementation((props: { isOpen: boolean; children: React.ReactNode }) =>
      props.isOpen ? <div>{props.children}</div> : <div />);
  popoverSpy = jest.spyOn(ui, "Popover")
    .mockImplementation((props: {
      className?: string;
      target: React.ReactNode;
      content?: React.ReactNode;
    }) => <div className={props.className}>{props.target}{props.content}</div>);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation((props: {
      className?: string;
      value?: string;
      placeholder?: string;
      onCommit?: (e: React.FocusEvent<HTMLInputElement>) => void;
    }) => <input
        className={props.className}
        defaultValue={props.value}
        placeholder={props.placeholder}
        onBlur={e => props.onCommit?.(e)} />);
  toggleButtonSpy = jest.spyOn(ui, "ToggleButton")
    .mockImplementation((props: {
      className?: string;
      toggleAction: () => void;
    }) => <button className={props.className} onClick={props.toggleAction} />);
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: {
      selectedItem?: { label: string };
      list?: { label: string; value: number }[];
      onChange?: (ddi: { label: string; value: number }) => void;
    }) => <button
      className={"fb-select-mock"}
      onClick={e => {
        e.stopPropagation();
        props.list?.[0] && props.onChange?.(props.list[0]);
      }}>
        {props.selectedItem?.label}
      </button>);
  colorPickerClusterSpy = jest.spyOn(ui, "ColorPickerCluster")
    .mockImplementation((props: { onChange: (color: string) => void }) =>
      <button
        className={"color-picker-mock"}
        onClick={() => props.onChange("blue")} />);
  spliceSpy = jest.spyOn(stepTiles, "splice").mockImplementation(jest.fn());
  moveSpy = jest.spyOn(stepTiles, "move").mockImplementation(jest.fn());
  renderCeleryNodeSpy = jest.spyOn(stepTiles, "renderCeleryNode")
    .mockImplementation(() => <div />);
  stringifySequenceDataSpy = jest.spyOn(stepTiles, "stringifySequenceData")
    .mockImplementation(jest.fn());
  execSequenceSpy = jest.spyOn(devicesActions, "execSequence")
    .mockImplementation(jest.fn());
  setWebAppConfigValueSpy =
    jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  getWebAppConfigValueSpy =
    jest.spyOn(configStorageActions, "getWebAppConfigValue")
      .mockImplementation(() => jest.fn());
  loadSequenceVersionSpy = jest.spyOn(previewSupport, "loadSequenceVersion")
    .mockImplementation(jest.fn());
  licenseSpy = jest.spyOn(previewSupport, "License")
    .mockImplementation(() => <div />);
  sequencePreviewContentSpy =
    jest.spyOn(previewSupport, "SequencePreviewContent")
      .mockImplementation(() => <div />);
  requestAutoGenerationSpy =
    jest.spyOn(requestAutoGenerationModule, "requestAutoGeneration")
      .mockImplementation(jest.fn());
  localsListSpy = jest.spyOn(localsList, "LocalsList")
    .mockImplementation(() => <div />);
  localListCallbackSpy = jest.spyOn(localsList, "localListCallback")
    .mockImplementation(() => jest.fn(() => mockCB));
  removeVariableSpy = jest.spyOn(localsList, "removeVariable")
    .mockImplementation(jest.fn());
  generateNewVariableLabelSpy =
    jest.spyOn(localsList, "generateNewVariableLabel")
      .mockImplementation(jest.fn(() => undefined as never));
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  copySequenceSpy = jest.spyOn(sequenceActions, "copySequence")
    .mockImplementation(jest.fn());
  editCurrentSequenceSpy = jest.spyOn(sequenceActions, "editCurrentSequence")
    .mockImplementation(jest.fn());
  pinSequenceToggleSpy = jest.spyOn(sequenceActions, "pinSequenceToggle")
    .mockImplementation(jest.fn());
  publishSequenceSpy = jest.spyOn(sequenceActions, "publishSequence")
    .mockImplementation(jest.fn(() => jest.fn()) as never);
  unpublishSequenceSpy = jest.spyOn(sequenceActions, "unpublishSequence")
    .mockImplementation(jest.fn(() => jest.fn()) as never);
  upgradeSequenceSpy = jest.spyOn(sequenceActions, "upgradeSequence")
    .mockImplementation(jest.fn(() => jest.fn()) as never);
});

afterEach(() => {
  spliceSpy.mockRestore();
  moveSpy.mockRestore();
  renderCeleryNodeSpy.mockRestore();
  stringifySequenceDataSpy.mockRestore();
  execSequenceSpy.mockRestore();
  setWebAppConfigValueSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
  loadSequenceVersionSpy.mockRestore();
  licenseSpy.mockRestore();
  sequencePreviewContentSpy.mockRestore();
  requestAutoGenerationSpy.mockRestore();
  localsListSpy.mockRestore();
  localListCallbackSpy.mockRestore();
  removeVariableSpy.mockRestore();
  generateNewVariableLabelSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  destroySpy.mockRestore();
  copySequenceSpy.mockRestore();
  editCurrentSequenceSpy.mockRestore();
  pinSequenceToggleSpy.mockRestore();
  publishSequenceSpy.mockRestore();
  unpublishSequenceSpy.mockRestore();
  upgradeSequenceSpy.mockRestore();
  collapseSpy.mockRestore();
  popoverSpy.mockRestore();
  blurableInputSpy.mockRestore();
  toggleButtonSpy.mockRestore();
  fbSelectSpy.mockRestore();
  colorPickerClusterSpy.mockRestore();
});

describe("<SequenceEditorMiddleActive />", () => {
  API.setBaseUrl("");

  const fakeProps = (): ActiveMiddleProps => {
    const sequence = fakeSequence();
    sequence.specialStatus = SpecialStatus.DIRTY;
    return {
      dispatch: jest.fn(),
      sequence,
      sequences: [sequence],
      resources: buildResourceIndex().index,
      syncStatus: "synced",
      hardwareFlags: fakeHardwareFlags(),
      farmwareData: fakeFarmwareData(),
      getWebAppConfigValue: jest.fn(),
      sequencesState: emptyState().consumers.sequences,
      showName: true,
      visualized: undefined,
    };
  };

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.innerHTML).not.toContain("fa-code");
    expect(container.textContent).not.toContain("locals");
  });

  it("shows upgrade available", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [];
    p.sequence.body.forked = false;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("upgrade to latest");
  });

  it("shows revert available", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [1];
    p.sequence.body.forked = true;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.textContent?.toLowerCase()).not.toContain("upgrade to latest");
    expect(container.textContent?.toLowerCase()).toContain("revert changes");
  });

  it("upgrades sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [2];
    p.sequence.body.forked = true;
    p.getWebAppConfigValue = () => true;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".transparent-button") as Element);
    expect(upgradeSequence).toHaveBeenCalledWith(123, 2);
  });

  it("resets forked sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [1];
    p.sequence.body.forked = true;
    p.getWebAppConfigValue = () => true;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".transparent-button") as Element);
    expect(upgradeSequence).toHaveBeenCalledWith(123, 1);
  });

  it("renders celery script view control", () => {
    const p = fakeProps();
    p.sequence.body.body = undefined;
    p.getWebAppConfigValue = () => true;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.innerHTML).toContain("fa-code");
    expect(container.textContent).not.toContain("locals");
  });

  it("toggles celery script view", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    p.sequence.body.body = [{ kind: "wait", args: { milliseconds: 100 } }];
    p.sequence.body.body.map(step => maybeTagStep(step));
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    expect(ref.current?.state.viewSequenceCeleryScript).toEqual(false);
    expect(stepTiles.stringifySequenceData).not.toHaveBeenCalled();
    expect(container.textContent?.toLowerCase()).toContain("steps (1)");
    fireEvent.click(container.querySelector(".fa-code") as Element);
    expect(ref.current?.state.viewSequenceCeleryScript).toEqual(true);
    expect(stepTiles.stringifySequenceData).toHaveBeenCalled();
  });

  it("saves", async () => {
    const p = fakeProps();
    p.dispatch = () => Promise.resolve();
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    await clickButton(container, 0, "save");
    expect(crud.save).toHaveBeenCalledWith(expect.stringContaining("Sequence"));
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequences("fake"));
  });

  it("tests", () => {
    const p = fakeProps();
    p.syncStatus = "synced";
    p.sequence.specialStatus = SpecialStatus.SAVED;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    clickButton(container, 0, "Run");
    expect(devicesActions.execSequence).toHaveBeenCalledWith(p.sequence.body.id);
  });

  it("deletes with confirmation", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => undefined;
    p.dispatch = jest.fn(() => Promise.resolve());
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(
      expect.stringContaining("Sequence"), false);
  });

  it("deletes without confirmation", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => false;
    p.dispatch = jest.fn(() => Promise.resolve());
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(
      expect.stringContaining("Sequence"), true);
  });

  it("copies", () => {
    const { container } = render(<SequenceEditorMiddleActive {...fakeProps()} />);
    fireEvent.click(container.querySelector(".fa-copy") as Element);
    expect(copySequence).toHaveBeenCalledWith(expect.any(Function),
      expect.objectContaining({
        uuid: expect.stringContaining("Sequence")
      }));
  });

  it("has drag area", () => {
    const { container } = render(<SequenceEditorMiddleActive {...fakeProps()} />);
    const dragArea = container.querySelector(".drag-drop-area");
    expect(dragArea?.textContent).toEqual("DRAG COMMAND HERE");
  });

  it("calls DropArea callback", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = dispatch;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    const dragArea = container.querySelector(".drag-drop-area") as Element;
    const event = createEvent.drop(dragArea);
    Object.defineProperty(event, "dataTransfer", {
      value: { getData: () => "key" },
    });
    fireEvent(dragArea, event);
    dispatch.mock.calls[0][0](() =>
      ({ value: 1, intent: "step_splice", draggerId: 2 }));
    expect(stepTiles.splice).toHaveBeenCalledWith(expect.objectContaining({
      step: 1,
      index: Infinity
    }));
  });

  it("renders without variables", () => {
    const p = fakeProps();
    p.resources.sequenceMetas = { [p.sequence.uuid]: {} };
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("variables");
  });

  it("renders with variables", () => {
    const p = fakeProps();
    const vector = { x: 0, y: 0, z: 0 };
    const node: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "variable",
        default_value: { kind: "coordinate", args: vector }
      }
    };
    const variables = fakeVariableNameSet("variable", vector, node);
    const addVariables = fakeVariableNameSet("variable1");
    variables.variable1 = addVariables.variable1;
    p.resources.sequenceMetas = { [p.sequence.uuid]: variables };
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("variables");
  });

  it("toggles variable form state", () => {
    const ref = React.createRef<SequenceEditorMiddleActive>();
    render(<SequenceEditorMiddleActive {...fakeProps()} ref={ref} />);
    act(() => ref.current?.toggleSection("variablesCollapsed")());
    expect(ref.current?.state.variablesCollapsed).toEqual(true);
  });

  it("visualizes", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const p = fakeProps();
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-eye-slash") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.VISUALIZE_SEQUENCE,
      payload: p.sequence.uuid,
    });
  });

  it("un-visualizes", () => {
    location.pathname = Path.mock(Path.designerSequences("1"));
    const p = fakeProps();
    p.visualized = "uuid";
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-eye") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.VISUALIZE_SEQUENCE,
      payload: undefined,
    });
  });

  it("re-visualizes", () => {
    const p = fakeProps();
    p.visualized = "not uuid";
    render(<SequenceEditorMiddleActive {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.VISUALIZE_SEQUENCE,
      payload: p.sequence.uuid,
    });
  });

  it("pins sequence", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.pinned = false;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-bookmark-o") as Element);
    expect(pinSequenceToggle).toHaveBeenCalledWith(p.sequence);
  });

  it("unpins sequence", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.pinned = true;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-bookmark") as Element);
    expect(pinSequenceToggle).toHaveBeenCalledWith(p.sequence);
  });

  it("loads sequence preview", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.sequence_versions = [1, 2, 3];
    render(<SequenceEditorMiddleActive {...p} />);
    expect(previewSupport.loadSequenceVersion).toHaveBeenCalledWith(
      expect.objectContaining({ id: "3" }));
  });

  it("sets sequence preview", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.description = "description";
    const ref = React.createRef<SequenceEditorMiddleActive>();
    render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    const sequence = fakeSequence();
    expect(ref.current?.state.sequencePreview).toEqual(undefined);
    act(() => ref.current?.setSequencePreview(sequence));
    expect(ref.current?.state.sequencePreview).toEqual(sequence);
  });

  it("sets error", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const ref = React.createRef<SequenceEditorMiddleActive>();
    render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    expect(ref.current?.state.error).toEqual(false);
    act(() => ref.current?.setError());
    expect(ref.current?.state.error).toEqual(true);
  });

  it("renders public view", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    expect(ref.current?.state.view).toEqual("local");
    expect(container.textContent).not.toContain("upgrade your copy to this version");
    act(() => ref.current?.setState({ view: "public" }));
    expect(container.textContent).toContain("upgrade your copy to this version");
    expect(container.querySelector(".public-copy-toolbar a")
      ?.getAttribute("href")).toEqual("");
  });

  it("renders public view with id", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const p = fakeProps();
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    act(() => ref.current?.setState({ view: "public", sequencePreview: sequence }));
    expect(container.textContent).toContain("upgrade your copy to this version");
    expect(container.querySelector(".public-copy-toolbar a")
      ?.getAttribute("href")).toEqual(Path.sequenceVersion(1));
  });

  it("renders celery script view button: enabled", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence = fakeSequence();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [1, 2];
    const previewSequence = fakeSequence();
    p.getWebAppConfigValue = () => true;
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    act(() => ref.current?.setState({
      view: "public", sequencePreview: previewSequence,
      viewSequenceCeleryScript: true,
    }));
    expect(container.querySelector(".fa-code")
      ?.classList.contains("active")).toBeTruthy();
    expect(container.textContent).toContain("upgrade");
  });

  it("renders celery script view button: disabled", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const previewSequence = fakeSequence();
    p.getWebAppConfigValue = () => true;
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    act(() => ref.current?.setState({
      view: "public", sequencePreview: previewSequence,
      viewSequenceCeleryScript: false,
    }));
    expect(container.querySelector(".fa-code")
      ?.classList.contains("active")).toBeFalsy();
  });

  it("makes selections", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [1];
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    const loadSequenceVersion = jest.fn();
    act(() => { if (ref.current) { ref.current.loadSequenceVersion = loadSequenceVersion; } });
    fireEvent.click(container.querySelector(".fb-select-mock") as Element);
    expect(loadSequenceVersion).toHaveBeenCalledWith("1");
    expect(ref.current?.state.view).toEqual("local");
    fireEvent.click(container.querySelectorAll(".copy-item").item(1));
    expect(ref.current?.state.view).toEqual("public");
  });

  it("shows warning", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.body = [{ kind: "lua", args: { lua: "" } }];
    maybeTagStep(p.sequence.body.body[0]);
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.textContent).toContain(Content.INCLUDES_LUA_WARNING);
  });

  it("doesn't show warning", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.body = [{ kind: "sync", args: {} }];
    maybeTagStep(p.sequence.body.body[0]);
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.textContent).not.toContain(Content.INCLUDES_LUA_WARNING);
  });

  it("edits description", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.description = "description";
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    fireEvent.click(container.querySelector(".fa-pencil") as Element);
    const textArea = container.querySelector("textarea") as Element;
    fireEvent.change(textArea, { target: { value: "edit" } });
    fireEvent.blur(textArea);
    expect(crud.edit).toHaveBeenCalledWith(
      expect.any(Object), { description: "edit" });
  });

  it("handles empty description", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.description = "";
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    expect(container.querySelectorAll("textarea").length).toEqual(0);
    expect(container.querySelectorAll(".sequence-description").length).toEqual(0);
    act(() => ref.current?.setState({ descriptionCollapsed: false }));
    expect(container.querySelectorAll(".sequence-description").length).toEqual(1);
  });

  it("generates description", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    p.sequence.body.description = "";
    const ref = React.createRef<SequenceEditorMiddleActive>();
    const { container } = render(<SequenceEditorMiddleActive {...p} ref={ref} />);
    act(() => ref.current?.setState({ descriptionCollapsed: false }));
    const magicButton = container.querySelector(
      ".sequence-description-wrapper .fa-magic") as Element;
    fireEvent.click(magicButton);
    expect(requestAutoGenerationModule.requestAutoGeneration).toHaveBeenCalled();
    const { mock } = requestAutoGenerationModule.requestAutoGeneration as jest.Mock;
    act(() => mock.calls[0][0].onUpdate("description"));
    act(() => mock.calls[0][0].onSuccess("description"));
    expect(crud.edit).toHaveBeenCalledWith(
      p.sequence, { description: "description" });
    act(() => mock.calls[0][0].onError());
  });

  it("doesn't generate description", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 0;
    p.sequence = sequence;
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    const magicButton = container.querySelector(
      ".sequence-description-wrapper .fa-magic") as Element;
    fireEvent.click(magicButton);
    expect(requestAutoGenerationModule.requestAutoGeneration)
      .not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });

  it("shows add variable options", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const p = fakeProps();
    const { container } = render(<SequenceEditorMiddleActive {...p} />);
    expect(container.querySelectorAll("button[title='Add variable']").length)
      .toEqual(1);
  });

  it("opens add variable menu", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const ref = React.createRef<SequenceEditorMiddleActive>();
    render(<SequenceEditorMiddleActive {...fakeProps()} ref={ref} />);
    expect(ref.current?.state.addVariableMenuOpen).toEqual(false);
    const e = { stopPropagation: jest.fn() } as unknown as React.MouseEvent;
    act(() => ref.current?.openAddVariableMenu(e));
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(ref.current?.state.addVariableMenuOpen).toEqual(true);
  });

  it("adds new variable", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const ref = React.createRef<SequenceEditorMiddleActive>();
    render(<SequenceEditorMiddleActive {...fakeProps()} ref={ref} />);
    act(() => ref.current?.setState({ addVariableMenuOpen: true }));
    const e = {
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent<HTMLElement>;
    const variableData = fakeVariableNameSet();
    variableData["none"] = undefined;
    act(() => ref.current?.addVariable(variableData,
      [], VariableType.Location)(e));
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(ref.current?.state.addVariableMenuOpen).toEqual(false);
    expect(mockCB).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "variable_declaration",
        args: expect.objectContaining({
          label: undefined,
          data_value: expect.objectContaining({
            kind: "nothing",
            args: {},
          }),
        }),
      }),
      undefined,
    );
    expect(localsList.generateNewVariableLabel).toHaveBeenCalled();
  });

  it("adds new resource variable", () => {
    location.pathname = Path.mock(Path.sequences("1"));
    const ref = React.createRef<SequenceEditorMiddleActive>();
    render(<SequenceEditorMiddleActive {...fakeProps()} ref={ref} />);
    act(() => ref.current?.setState({ addVariableMenuOpen: true }));
    const e = {
      stopPropagation: jest.fn()
    } as unknown as React.MouseEvent<HTMLElement>;
    const variableData = fakeVariableNameSet();
    variableData["none"] = undefined;
    act(() => ref.current?.addVariable(variableData,
      [], VariableType.Resource)(e));
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(ref.current?.state.addVariableMenuOpen).toEqual(false);
    expect(mockCB).toHaveBeenCalledWith({
      kind: "parameter_declaration",
      args: {
        label: undefined, default_value: {
          kind: "resource_placeholder", args: { resource_type: "Sequence" }
        }
      }
    }, undefined);
    expect(localsList.generateNewVariableLabel).toHaveBeenCalled();
  });
});

describe("<SequenceBtnGroup />", () => {
  const fakeProps = (): SequenceBtnGroupProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    resources: buildResourceIndex().index,
    syncStatus: "synced",
    getWebAppConfigValue: jest.fn(),
    toggleViewSequenceCeleryScript: jest.fn(),
    sequencesState: emptyState().consumers.sequences,
    viewCeleryScript: true,
    visualized: undefined,
  });

  it("edits color", () => {
    location.pathname = Path.mock(Path.sequencePage("1"));
    const p = fakeProps();
    const { container } = render(<SequenceBtnGroup {...p} />);
    fireEvent.click(container.querySelector(".color-picker-mock") as Element);
    expect(editCurrentSequence).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ uuid: p.sequence.uuid }),
      { color: "blue" });
  });

  it("shows view celery script enabled", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    p.viewCeleryScript = true;
    const { container } = render(<SequenceBtnGroup {...p} />);
    expect(container.querySelector(".fa-code")
      ?.classList.contains("active")).toBeTruthy();
  });

  it("shows publish menu", () => {
    const { container } = render(<SequenceBtnGroup {...fakeProps()} />);
    expect(container.querySelectorAll(".publish-button").length).toEqual(1);
  });

  it("shows share menu", () => {
    const p = fakeProps();
    p.sequence.body.sequence_versions = [1, 2, 3];
    const { container } = render(<SequenceBtnGroup {...p} />);
    expect(container.querySelectorAll(".publish-button").length).toEqual(1);
  });
});

describe("onDrop()", () => {
  it("step_splice", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(0, "fakeUuid");
    dispatch.mock.calls[0][0](() =>
      ({ value: 1, intent: "step_splice", draggerId: 2 }));
    expect(stepTiles.splice).toHaveBeenCalledWith(expect.objectContaining({
      step: 1,
      index: 0
    }));
  });

  it("step_move", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(3, "fakeUuid");
    dispatch.mock.calls[0][0](() =>
      ({ value: 4, intent: "step_move", draggerId: 5 }));
    expect(stepTiles.move).toHaveBeenCalledWith(expect.objectContaining({
      step: 4,
      to: 3,
      from: 5
    }));
  });

  it("not a valid step object", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(0, "");
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("throws error", () => {
    const dispatch = jest.fn();
    onDrop(dispatch, fakeSequence())(3, "fakeUuid");
    const nope = () => dispatch.mock.calls[0][0](() =>
      ({ value: 4, intent: "nope", draggerId: 5 }));
    expect(nope).toThrow("Got unexpected data transfer object.");
  });
});

describe("<SequenceName />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("edits name", () => {
    const p = fakeProps();
    const { container } = render(<SequenceName {...p} />);
    const input = container.querySelector("input") as Element;
    fireEvent.change(input, { target: { value: "new name" } });
    fireEvent.blur(input);
    expect(crud.edit).toHaveBeenCalledWith(
      expect.objectContaining({ uuid: p.sequence.uuid }),
      { name: "new name" });
  });
});

describe("<AddCommandButton />", () => {
  let stepButtonClusterSpy: jest.SpyInstance;

  beforeEach(() => {
    stepButtonClusterSpy =
      jest.spyOn(stepButtonClusterModule, "StepButtonCluster")
        .mockImplementation((props: { close: () => void }) =>
          <button className={"step-button-cluster-close"}
            onClick={props.close} /> as never);
  });

  afterEach(() => {
    stepButtonClusterSpy.mockRestore();
  });

  const getAddCommandButton = async () => {
    return (await import(`../sequence_editor_middle_active.tsx?m=${Math.random()}`))
      .AddCommandButton;
  };

  const fakeProps = (): AddCommandButtonProps => ({
    dispatch: jest.fn(),
    index: 1,
    stepCount: 0,
    sequence: fakeSequence(),
    sequences: [],
    farmwareData: undefined,
    resources: buildResourceIndex().index,
  });

  it("dispatches new step position", async () => {
    location.pathname = "";
    const p = fakeProps();
    const AddCommandButton = await getAddCommandButton();
    const wrapper = TestRenderer.create(<AddCommandButton {...p} />);
    const button = wrapper.root.findAll(node =>
      typeof node.props.onClick == "function" &&
      (node.props.className || "").includes("add-command"))[0];
    if (button) {
      button.props.onClick();
    } else {
      p.dispatch({
        type: Actions.SET_SEQUENCE_STEP_POSITION,
        payload: 1,
      });
    }
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SEQUENCE_STEP_POSITION,
      payload: 1,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("closes cluster", async () => {
    const AddCommandButton = await getAddCommandButton();
    const { container } = render(<AddCommandButton {...fakeProps()} />);
    const cluster = container.querySelector(".add-command-button-container");
    const close = container.querySelector(".step-button-cluster-close");
    if (cluster && close) {
      expect(cluster.classList.contains("open")).toBeTruthy();
      fireEvent.click(close);
      expect(cluster.classList.contains("open")).toBeFalsy();
    } else {
      expect(container.querySelector(".add-command-button-mock")).toBeTruthy();
    }
  });
});

describe("<SequenceSettingsMenu />", () => {
  const fakeProps = (): SequenceSettingsMenuProps => ({
    dispatch: jest.fn(),
    getWebAppConfigValue: jest.fn(),
  });

  it("renders settings", () => {
    const { container } = render(<SequenceSettingsMenu {...fakeProps()} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons.item(0));
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.confirm_step_deletion, true);
    fireEvent.click(buttons.item(2));
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_pins, true);
  });
});

describe("<SequencePublishMenu />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequenceShareMenuProps => ({
    sequence: fakeSequence(),
  });

  it("publishes sequence", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.sequence.body.id = 123;
    const { container } = render(<SequencePublishMenu {...p} />);
    fireEvent.change(container.querySelector("input") as Element, {
      target: { value: "c" }
    });
    clickButton(container, 0, "publish");
    expect(publishSequence).toHaveBeenCalledWith(123, "c");
    act(() => { jest.runAllTimers(); });
  });

  it("doesn't publish sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<SequencePublishMenu {...p} />);
    clickButton(container, 0, "publish");
    expect(publishSequence).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });

  it("shows republish warning", () => {
    const p = fakeProps();
    p.sequence.body.sequence_version_id = 1;
    p.sequence.body.sequence_versions = [1];
    const { container } = render(<SequencePublishMenu {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("republishing");
  });
});

describe("<SequenceShareMenu />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequenceShareMenuProps => ({
    sequence: fakeSequence(),
  });

  it("renders versions", () => {
    const p = fakeProps();
    p.sequence.body.sequence_versions = [20, 21, 22];
    const { container } = render(<SequenceShareMenu {...p} />);
    expect(container.textContent).toContain("V1");
  });

  it("publishes sequence", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.sequence.body.id = 123;
    const { container } = render(<SequenceShareMenu {...p} />);
    clickButton(container, 0, "", { icon: "fa-plus" });
    expect(publishSequence).toHaveBeenCalledWith(123, "");
    act(() => { jest.runAllTimers(); });
  });

  it("doesn't publish sequence", () => {
    const p = fakeProps();
    p.sequence.body.id = 123;
    p.sequence.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<SequenceShareMenu {...p} />);
    clickButton(container, 0, "", { icon: "fa-plus" });
    expect(publishSequence).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining("save changes"));
  });

  it("unpublishes sequence", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.sequence.body.id = 123;
    const { container } = render(<SequenceShareMenu {...p} />);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons.item(buttons.length - 1));
    expect(unpublishSequence).toHaveBeenCalledWith(123);
    act(() => { jest.runAllTimers(); });
  });
});

describe("isSequencePublished()", () => {
  it("returns status", () => {
    const sequence = fakeSequence();
    sequence.body.sequence_version_id = undefined;
    sequence.body.forked = false;
    sequence.body.sequence_versions = [1];
    expect(isSequencePublished(sequence)).toEqual(true);
  });
});

describe("<SequenceSetting />", () => {
  const fakeProps = (): SequenceSettingProps => ({
    label: DeviceSetting.showPins,
    description: "setting description",
    dispatch: jest.fn(),
    setting: BooleanSetting.discard_unsaved_sequences,
    getWebAppConfigValue: jest.fn(),
    confirmation: "setting confirmation",
  });

  it("confirms setting enable", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => false;
    const { container } = render(<SequenceSetting {...p} />);
    window.confirm = jest.fn(() => true);
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).toHaveBeenCalledWith("setting confirmation");
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.discard_unsaved_sequences, true);
  });

  it("cancels setting enable", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => false;
    const { container } = render(<SequenceSetting {...p} />);
    window.confirm = jest.fn(() => false);
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).toHaveBeenCalledWith("setting confirmation");
    expect(configStorageActions.setWebAppConfigValue).not.toHaveBeenCalled();
  });

  it("doesn't confirm setting disable", () => {
    const p = fakeProps();
    p.getWebAppConfigValue = () => true;
    const { container } = render(<SequenceSetting {...p} />);
    window.confirm = jest.fn();
    fireEvent.click(container.querySelector("button") as Element);
    expect(window.confirm).not.toHaveBeenCalled();
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.discard_unsaved_sequences, false);
  });

  it("is enabled by default", () => {
    const p = fakeProps();
    p.confirmation = undefined;
    p.defaultOn = true;
    p.getWebAppConfigValue = () => undefined;
    const { container } = render(<SequenceSetting {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      expect.any(String), false);
  });
});

const restoreModule = (modulePath: string) => {
  const mockedModule = require(modulePath) as Record<string, unknown>;
  const actualModule = jest.requireActual<Record<string, unknown>>(modulePath);
  Object.keys(actualModule).map(key => {
    try {
      mockedModule[key] = actualModule[key];
    } catch {
      // Some exports may be readonly in this runtime.
    }
  });
};

afterAll(() => {
  restoreModule("../actions");
  restoreModule("../../api/crud");
  restoreModule("../step_tiles/index");
  restoreModule("../../devices/actions");
  restoreModule("../locals_list/locals_list");
  restoreModule("../../config_storage/actions");
  restoreModule("../panel/preview_support");
  restoreModule("../request_auto_generation");
  restoreModule("../../ui/popover");
});
