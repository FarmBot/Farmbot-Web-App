import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
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
import * as foldersActions from "../../../folders/actions";
import * as sequenceActions from "../../actions";
import { sequencesPanelState } from "../../../__test_support__/panel_state";
import { Actions } from "../../../constants";
import { emptyState } from "../../../resources/reducer";
import { Path } from "../../../internal_urls";
import { mountWithContext } from "../../../__test_support__/mount_with_context";
import axios from "axios";
import * as screenSize from "../../../screen_size";

API.setBaseUrl("");

let axiosGetSpy: jest.SpyInstance;
let installSequenceSpy: jest.SpyInstance;
let addNewSequenceToFolderSpy: jest.SpyInstance;
let createFolderSpy: jest.SpyInstance;
let toggleAllSpy: jest.SpyInstance;
let updateSearchTermSpy: jest.SpyInstance;
let isMobileSpy: jest.SpyInstance;

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
  isMobileSpy = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
});

afterEach(() => {
  axiosGetSpy.mockRestore();
  installSequenceSpy.mockRestore();
  addNewSequenceToFolderSpy.mockRestore();
  createFolderSpy.mockRestore();
  toggleAllSpy.mockRestore();
  updateSearchTermSpy.mockRestore();
  isMobileSpy.mockRestore();
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
    const { container } = render(<DesignerSequenceList {...fakeProps()} />);
    expect(container.textContent).toContain("folder");
  });

  it("toggle section", () => {
    const p = fakeProps();
    const ref = React.createRef<DesignerSequenceList>();
    render(<DesignerSequenceList ref={ref} {...p} />);
    ref.current?.toggleSection("sequences")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SEQUENCES_PANEL_OPTION,
      payload: "sequences",
    });
  });

  it("adds new sequence", () => {
    const { container } = render(<DesignerSequenceList {...fakeProps()} />);
    fireEvent.click(
      container.querySelector("button[title='add new sequence']") as Element);
    expect(addNewSequenceToFolderSpy).toHaveBeenCalled();
  });

  it("adds new folder", () => {
    const { container } = render(<DesignerSequenceList {...fakeProps()} />);
    fireEvent.click(
      container.querySelector("button[title='Create subfolder']") as Element);
    expect(createFolderSpy).toHaveBeenCalled();
  });

  it("opens folders", () => {
    const { container } = render(<DesignerSequenceList {...fakeProps()} />);
    fireEvent.click(
      container.querySelector("button[title='toggle folder open']") as Element);
    expect(toggleAllSpy).toHaveBeenCalled();
  });

  it("imports sequence", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const { container } = render(<DesignerSequenceList {...p} />);
    await waitFor(() =>
      expect(container.querySelectorAll(".fa-download").length)
        .toBeGreaterThan(0));
    fireEvent.click(container.querySelector(".fa-download") as Element);
    expect(installSequenceSpy).toHaveBeenCalledWith(1);
  });

  it("opens description", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const { container } = render(<DesignerSequenceList {...p} />);
    await waitFor(() =>
      expect(container.querySelectorAll(".sequence-list-item-icons").length)
        .toBeGreaterThan(0));
    const icons = container.querySelectorAll(".sequence-list-item-icons").item(0);
    expect(icons.classList.contains("show-on-hover")).toBeTruthy();
    const helpIcon = icons.querySelector(".help-icon");
    expect(helpIcon).toBeTruthy();
    fireEvent.click(helpIcon as Element);
    await waitFor(() =>
      expect(
        container.querySelectorAll(".sequence-list-item-icons").item(0)
          .classList.contains("show-on-hover"))
        .toBeFalsy());
  });

  it("filters sequences", async () => {
    const p = fakeProps();
    p.sequencesPanelState.featured = true;
    const folderData = mapStateToFolderProps(fakeState());
    folderData.searchTerm = "second";
    p.folderData = folderData;
    const { container } = render(<DesignerSequenceList {...p} />);
    await waitFor(() =>
      expect(container.textContent?.toLowerCase()).toContain("second"));
    expect(container.textContent?.toLowerCase()).not.toContain("first");
  });

  it("navigates to sequence page", () => {
    location.pathname = Path.mock(Path.designerSequences());
    const wrapper = mountWithContext(<DesignerSequenceList {...fakeProps()} />);
    fireEvent.click((wrapper.container
      .querySelector("button.fb-button.clear.row.half-gap") as Element));
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequencePage());
  });

  it("navigates to designer sequence page", () => {
    location.pathname = Path.mock(Path.sequencePage());
    const wrapper = mountWithContext(<DesignerSequenceList {...fakeProps()} />);
    fireEvent.click((wrapper.container
      .querySelector("button.fb-button.clear.row.half-gap") as Element));
    expect(mockNavigate).toHaveBeenCalledWith(Path.designerSequences());
  });
});
