let mockIsMobile = false;
import { PopoverProps } from "../../../ui/popover";

import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerSequenceEditor as DesignerSequenceEditor, ResourceTitle,
  ResourceTitleProps,
} from "../editor";
import { SequencesProps } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  fakeHardwareFlags, fakeFarmwareData,
} from "../../../__test_support__/fake_sequence_step_data";
import { mapStateToFolderProps } from "../../../folders/map_state_to_props";
import { fakeState } from "../../../__test_support__/fake_state";
import * as setActiveSequenceByNameModule from "../../set_active_sequence_by_name";
import { Path } from "../../../internal_urls";
import { sequencesPanelState } from "../../../__test_support__/panel_state";
import { Color } from "farmbot";
import * as crud from "../../../api/crud";
import * as requestAutoGenerationModule from "../../request_auto_generation";
import { API } from "../../../api";
import { error } from "../../../toast/toast";
import * as foldersActions from "../../../folders/actions";
import { emptyState } from "../../../resources/reducer";
import { mountWithContext } from "../../../__test_support__/mount_with_context";
import * as screenSize from "../../../screen_size";
import * as popoverModule from "../../../ui/popover";

let isMobileSpy: jest.SpyInstance;
let setActiveSequenceByNameSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let requestAutoGenerationSpy: jest.SpyInstance;
let addNewSequenceToFolderSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  mockIsMobile = false;
  isMobileSpy = jest.spyOn(screenSize, "isMobile")
    .mockImplementation(() => mockIsMobile);
  setActiveSequenceByNameSpy = jest.spyOn(
    setActiveSequenceByNameModule,
    "setActiveSequenceByName",
  ).mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  requestAutoGenerationSpy = jest.spyOn(
    requestAutoGenerationModule,
    "requestAutoGeneration",
  ).mockImplementation(jest.fn());
  addNewSequenceToFolderSpy = jest.spyOn(
    foldersActions,
    "addNewSequenceToFolder",
  ).mockImplementation(jest.fn());
  popoverSpy = jest.spyOn(popoverModule, "Popover").mockImplementation(
    ({ target, content }: PopoverProps) => <div>{target}{content}</div>);
});

afterEach(() => {
  isMobileSpy.mockRestore();
  setActiveSequenceByNameSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  requestAutoGenerationSpy.mockRestore();
  addNewSequenceToFolderSpy.mockRestore();
  popoverSpy.mockRestore();
});

describe("<DesignerSequenceEditor />", () => {
  API.setBaseUrl("");

  const fakeProps = (): SequencesProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    sequences: [],
    resources: buildResourceIndex().index,
    syncStatus: "synced",
    hardwareFlags: fakeHardwareFlags(),
    farmwareData: fakeFarmwareData(),
    getWebAppConfigValue: jest.fn(),
    sequencesState: emptyState().consumers.sequences,
    folderData: mapStateToFolderProps(fakeState()),
    sequencesPanelState: sequencesPanelState(),
    visualized: undefined,
  });

  it("renders", () => {
    const wrapper = mount(<DesignerSequenceEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("save");
  });

  it("handles missing sequence", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    expect(setActiveSequenceByNameSpy).toHaveBeenCalled();
    expect(wrapper.text().toLowerCase()).toContain("no sequence selected");
    expect(wrapper.html()).not.toContain("select color");
    wrapper.find("button").first().simulate("click");
    expect(addNewSequenceToFolderSpy).toHaveBeenCalled();
  });

  it("changes color", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.color = "" as Color;
    p.sequence = sequence;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    wrapper.find(".color-picker-item-wrapper").first().simulate("click");
    expect(editSpy).toHaveBeenCalledWith(p.sequence, { color: "blue" });
  });

  it("generates name and color", () => {
    const p = fakeProps();
    const wrapper = mount<DesignerSequenceEditor>(
      <DesignerSequenceEditor {...p} />);
    expect(wrapper.state().processingTitle).toEqual(false);
    expect(wrapper.state().processingColor).toEqual(false);
    wrapper.find(".fa-magic").first().simulate("click");
    expect(wrapper.state().processingTitle).toEqual(true);
    expect(wrapper.state().processingColor).toEqual(true);
    expect(requestAutoGenerationSpy).toHaveBeenCalled();
    const { mock } = requestAutoGenerationSpy;
    mock.calls[0][0].onUpdate("title");
    mock.calls[0][0].onSuccess("title");
    expect(editSpy).toHaveBeenCalledWith(p.sequence, { name: "title" });
    mock.calls[0][0].onError();
    mock.calls[1][0].onSuccess("red");
    expect(editSpy).toHaveBeenCalledWith(p.sequence, { color: "red" });
    mock.calls[1][0].onSuccess("nope");
    expect(editSpy).toHaveBeenCalledWith(p.sequence, { color: "gray" });
    mock.calls[1][0].onError();
    expect(wrapper.state().processingTitle).toEqual(false);
    expect(wrapper.state().processingColor).toEqual(false);
  });

  it("doesn't generate name and color", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 0;
    p.sequence = sequence;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    wrapper.find(".fa-magic").first().simulate("click");
    expect(requestAutoGenerationSpy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });

  it("navigates to full page editor", () => {
    mockIsMobile = false;
    const p = fakeProps();
    const wrapper = mountWithContext(<DesignerSequenceEditor {...p} />);
    wrapper.find(".fa-expand").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequencePage("fake"));
  });
});

describe("<ResourceTitle />", () => {
  const fakeProps = (): ResourceTitleProps => ({
    dispatch: jest.fn(),
    resource: fakeSequence(),
    fallback: "string",
  });

  it("changes name", () => {
    const wrapper = mount(<ResourceTitle {...fakeProps()} />);
    expect(wrapper.find("span").first().props().style).toEqual({});
    wrapper.find("span").first().simulate("click");
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "abc" } });
    wrapper.find("input").first().simulate("blur");
    expect(editSpy).toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("saves change", () => {
    const p = fakeProps();
    p.save = true;
    const wrapper = mount(<ResourceTitle {...p} />);
    wrapper.find("span").first().simulate("click");
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "abc" } });
    wrapper.find("input").first().simulate("blur");
    expect(editSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
  });

  it("is read-only", () => {
    const p = fakeProps();
    p.readOnly = true;
    const wrapper = mount(<ResourceTitle {...p} />);
    expect(wrapper.find("span").first().props().style)
      .toEqual({ pointerEvents: "none" });
  });
});
