let mockIsMobile = false;
jest.mock("../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

jest.mock("../../../sequences/set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn()
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../request_auto_generation", () => ({
  requestAutoGeneration: jest.fn(),
}));

jest.mock("../../../folders/actions", () => ({
  addNewSequenceToFolder: jest.fn(),
}));

import { PopoverProps } from "../../../ui/popover";
jest.mock("../../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

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
import {
  setActiveSequenceByName,
} from "../../set_active_sequence_by_name";
import { push } from "../../../history";
import { Path } from "../../../internal_urls";
import { sequencesPanelState } from "../../../__test_support__/panel_state";
import { Color } from "farmbot";
import { edit, save } from "../../../api/crud";
import { requestAutoGeneration } from "../../request_auto_generation";
import { API } from "../../../api";
import { error } from "../../../toast/toast";
import { addNewSequenceToFolder } from "../../../folders/actions";
import { emptyState } from "../../../resources/reducer";

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
  });

  it("renders", () => {
    const wrapper = mount(<DesignerSequenceEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("save");
  });

  it("handles missing sequence", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    expect(setActiveSequenceByName).toHaveBeenCalled();
    expect(wrapper.text().toLowerCase()).toContain("no sequence selected");
    expect(wrapper.html()).not.toContain("select color");
    wrapper.find("button").first().simulate("click");
    expect(addNewSequenceToFolder).toHaveBeenCalled();
  });

  it("changes color", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.color = "" as Color;
    p.sequence = sequence;
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    wrapper.find(".color-picker-item-wrapper").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(p.sequence, { color: "blue" });
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
    expect(requestAutoGeneration).toHaveBeenCalled();
    const { mock } = requestAutoGeneration as jest.Mock;
    mock.calls[0][0].onUpdate("title");
    mock.calls[0][0].onSuccess("title");
    expect(edit).toHaveBeenCalledWith(p.sequence, { name: "title" });
    mock.calls[0][0].onError();
    mock.calls[1][0].onSuccess("red");
    expect(edit).toHaveBeenCalledWith(p.sequence, { color: "red" });
    mock.calls[1][0].onSuccess("nope");
    expect(edit).toHaveBeenCalledWith(p.sequence, { color: "gray" });
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
    expect(requestAutoGeneration).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });

  it("navigates to full page editor", () => {
    mockIsMobile = false;
    const p = fakeProps();
    const wrapper = mount(<DesignerSequenceEditor {...p} />);
    wrapper.find(".fa-expand").first().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.sequencePage("fake"));
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
    expect(edit).toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });

  it("saves change", () => {
    const p = fakeProps();
    p.save = true;
    const wrapper = mount(<ResourceTitle {...p} />);
    wrapper.find("span").first().simulate("click");
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "abc" } });
    wrapper.find("input").first().simulate("blur");
    expect(edit).toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
  });

  it("is read-only", () => {
    const p = fakeProps();
    p.readOnly = true;
    const wrapper = mount(<ResourceTitle {...p} />);
    expect(wrapper.find("span").first().props().style)
      .toEqual({ pointerEvents: "none" });
  });
});
