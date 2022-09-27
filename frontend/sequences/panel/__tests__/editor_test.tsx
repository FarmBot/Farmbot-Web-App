jest.mock("../../../sequences/set_active_sequence_by_name", () => ({
  setActiveSequenceByName: jest.fn()
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
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

describe("<DesignerSequenceEditor />", () => {
  const fakeProps = (): SequencesProps => ({
    dispatch: jest.fn(),
    sequence: fakeSequence(),
    sequences: [],
    resources: buildResourceIndex().index,
    syncStatus: "synced",
    hardwareFlags: fakeHardwareFlags(),
    farmwareData: fakeFarmwareData(),
    getWebAppConfigValue: jest.fn(),
    menuOpen: undefined,
    stepIndex: undefined,
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
  });

  it("changes color", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.color = "" as Color;
    p.sequence = sequence;
    const wrapper = shallow(<DesignerSequenceEditor {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(edit).toHaveBeenCalledWith(p.sequence, { color: "red" });
  });

  it("navigates to full page editor", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 500,
      configurable: true
    });
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
});
