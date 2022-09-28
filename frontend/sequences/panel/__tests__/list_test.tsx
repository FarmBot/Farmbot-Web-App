jest.mock("axios", () => ({
  get: () => Promise.resolve({
    data: [
      {
        id: 1,
        name: "My First Sequence",
        description: "description",
        path: "",
        color: "gray",
      },
      {
        id: 2,
        name: "My Second Sequence",
        description: undefined,
        path: "",
        color: "gray",
      },
    ]
  }),
}));

jest.mock("../../actions", () => ({
  installSequence: jest.fn(() => jest.fn()),
}));

jest.mock("../../../folders/actions", () => ({
  addNewSequenceToFolder: jest.fn(),
  createFolder: jest.fn(),
  toggleAll: jest.fn(),
  updateSearchTerm: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerSequenceList as DesignerSequenceList,
} from "../list";
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
import { API } from "../../../api";
import { clickButton } from "../../../__test_support__/helpers";
import {
  addNewSequenceToFolder, createFolder, toggleAll,
} from "../../../folders/actions";
import { installSequence } from "../../actions";
import { sequencesPanelState } from "../../../__test_support__/panel_state";
import { Actions } from "../../../constants";

API.setBaseUrl("");

describe("<DesignerSequenceList />", () => {
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
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    expect(wrapper.text()).toContain("folder");
  });

  it("toggle section", () => {
    const p = fakeProps();
    const wrapper = shallow<DesignerSequenceList>(
      <DesignerSequenceList {...p} />);
    wrapper.instance().toggleSection("sequences")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SEQUENCES_PANEL_OPTION,
      payload: "sequences",
    });
  });

  it("adds new sequence", () => {
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 0, "", { icon: "fa-plus" });
    expect(addNewSequenceToFolder).toHaveBeenCalled();
  });

  it("adds new folder", () => {
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 1, "", { icon: "fa-folder" });
    expect(createFolder).toHaveBeenCalled();
  });

  it("opens folders", () => {
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 2, "", { icon: "fa-chevron-right" });
    expect(toggleAll).toHaveBeenCalled();
  });

  it("imports sequence", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const wrapper = await mount(<DesignerSequenceList {...p} />);
    wrapper.update();
    wrapper.find(".fa-download").first().simulate("click");
    expect(installSequence).toHaveBeenCalledWith(1);
  });

  it("opens description", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const wrapper = await mount(<DesignerSequenceList {...p} />);
    wrapper.update();
    expect(wrapper.find(".show-on-hover").length).toEqual(2);
    wrapper.find(".help-icon").last().simulate("click");
    expect(wrapper.find(".show-on-hover").length).toEqual(1);
  });

  it("filters sequences", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const folderData = mapStateToFolderProps(fakeState());
    folderData.searchTerm = "second";
    p.folderData = folderData;
    const wrapper = await mount(<DesignerSequenceList {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("first");
    expect(wrapper.text().toLowerCase()).toContain("second");
  });
});
