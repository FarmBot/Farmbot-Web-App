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
import * as foldersActions from "../../../folders/actions";
import * as sequenceActions from "../../actions";
import { sequencesPanelState } from "../../../__test_support__/panel_state";
import { Actions } from "../../../constants";
import { emptyState } from "../../../resources/reducer";
import { Path } from "../../../internal_urls";
import { mountWithContext } from "../../../__test_support__/mount_with_context";
import axios from "axios";

API.setBaseUrl("");

let axiosGetSpy: jest.SpyInstance;
let installSequenceSpy: jest.SpyInstance;
let addNewSequenceToFolderSpy: jest.SpyInstance;
let createFolderSpy: jest.SpyInstance;
let toggleAllSpy: jest.SpyInstance;
let updateSearchTermSpy: jest.SpyInstance;

beforeEach(() => {
  axiosGetSpy = jest.spyOn(axios, "get").mockImplementation(() => Promise.resolve({
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
  }) as never);
  installSequenceSpy = jest.spyOn(sequenceActions, "installSequence")
    .mockImplementation(() => jest.fn() as never);
  addNewSequenceToFolderSpy = jest.spyOn(foldersActions, "addNewSequenceToFolder")
    .mockImplementation(jest.fn());
  createFolderSpy = jest.spyOn(foldersActions, "createFolder")
    .mockImplementation(jest.fn());
  toggleAllSpy = jest.spyOn(foldersActions, "toggleAll")
    .mockImplementation(jest.fn());
  updateSearchTermSpy = jest.spyOn(foldersActions, "updateSearchTerm")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  axiosGetSpy.mockRestore();
  installSequenceSpy.mockRestore();
  addNewSequenceToFolderSpy.mockRestore();
  createFolderSpy.mockRestore();
  toggleAllSpy.mockRestore();
  updateSearchTermSpy.mockRestore();
});
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
    sequencesState: emptyState().consumers.sequences,
    folderData: mapStateToFolderProps(fakeState()),
    sequencesPanelState: sequencesPanelState(),
    visualized: undefined,
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
    clickButton(wrapper, 1, "", { icon: "fa-plus" });
    expect(addNewSequenceToFolderSpy).toHaveBeenCalled();
  });

  it("adds new folder", () => {
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 2, "", { icon: "fa-folder" });
    expect(createFolderSpy).toHaveBeenCalled();
  });

  it("opens folders", () => {
    const wrapper = mount(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 3, "", { icon: "fa-chevron-right" });
    expect(toggleAllSpy).toHaveBeenCalled();
  });

  it("imports sequence", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const wrapper = await mount(<DesignerSequenceList {...p} />);
    wrapper.update();
    wrapper.find(".fa-download").first().simulate("click");
    expect(installSequenceSpy).toHaveBeenCalledWith(1);
  });

  it("opens description", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const wrapper = await mount(<DesignerSequenceList {...p} />);
    wrapper.update();
    expect(wrapper.find(".sequence-list-item-icons").at(0)
      .hasClass("show-on-hover")).toBeTruthy();
    const helpIcon = wrapper.find(".sequence-list-item-icons").at(0)
      .find(".help-icon").first();
    expect(helpIcon.exists()).toBeTruthy();
    helpIcon.props().onClick?.({} as never);
    wrapper.update();
    expect(wrapper.find(".sequence-list-item-icons").at(0)
      .hasClass("show-on-hover")).toBeFalsy();
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

  it("navigates to sequence page", () => {
    location.pathname = Path.mock(Path.designerSequences());
    const wrapper = mountWithContext(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 0, "fullscreen");
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequencePage());
  });

  it("navigates to designer sequence page", () => {
    location.pathname = Path.mock(Path.sequencePage());
    const wrapper = mountWithContext(<DesignerSequenceList {...fakeProps()} />);
    clickButton(wrapper, 0, "collapse");
    expect(mockNavigate).toHaveBeenCalledWith(Path.designerSequences());
  });
});
