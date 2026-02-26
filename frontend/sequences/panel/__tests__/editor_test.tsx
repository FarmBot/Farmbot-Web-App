let mockIsMobile = false;
import { PopoverProps } from "../../../ui/popover";
const mockAddNewSequenceToFolder = jest.fn();

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
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
import { emptyState } from "../../../resources/reducer";
import { renderWithContext } from "../../../__test_support__/mount_with_context";
import * as screenSize from "../../../screen_size";
import * as popoverModule from "../../../ui/popover";
import * as folderActions from "../../../folders/actions";

let isMobileSpy: jest.SpyInstance;
let setActiveSequenceByNameSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let requestAutoGenerationSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;
let addNewSequenceToFolderSpy: jest.SpyInstance;

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
  addNewSequenceToFolderSpy = jest.spyOn(folderActions, "addNewSequenceToFolder")
    .mockImplementation((...args: unknown[]) =>
      mockAddNewSequenceToFolder(...args) as never);
  mockAddNewSequenceToFolder.mockClear();
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
    const { container } = render(<DesignerSequenceEditor {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("save");
  });

  it("handles missing sequence", () => {
    const p = fakeProps();
    p.sequence = undefined;
    const { container } = render(<DesignerSequenceEditor {...p} />);
    expect(setActiveSequenceByNameSpy).toHaveBeenCalled();
    expect(container.textContent?.toLowerCase()).toContain("no sequence selected");
    expect(container.innerHTML).not.toContain("select color");
    const addButton = container.querySelector("button.fb-button.green");
    expect(addButton).toBeTruthy();
    addButton && fireEvent.click(addButton);
    expect(mockAddNewSequenceToFolder).toHaveBeenCalled();
  });

  it("changes color", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.color = "" as Color;
    p.sequence = sequence;
    render(<DesignerSequenceEditor {...p} />);
    const colorPickerPopover = popoverSpy.mock.calls.find(
      ([popoverProps]) => !!(popoverProps.content as React.ReactElement)
        ?.props?.onChange);
    const colorPickerCluster = colorPickerPopover?.[0]
      .content as React.ReactElement<{ onChange: (color: Color) => void }>;
    expect(colorPickerCluster).toBeTruthy();
    colorPickerCluster.props.onChange("blue");
    expect(editSpy).toHaveBeenCalledWith(p.sequence, { color: "blue" });
  });

  it("generates name and color", async () => {
    const p = fakeProps();
    const ref = React.createRef<DesignerSequenceEditor>();
    const { container } = render(<DesignerSequenceEditor ref={ref} {...p} />);
    expect(ref.current?.state.processingTitle).toEqual(false);
    expect(ref.current?.state.processingColor).toEqual(false);
    fireEvent.click(container.querySelector(".fa-magic") as Element);
    expect(ref.current?.state.processingTitle).toEqual(true);
    expect(ref.current?.state.processingColor).toEqual(true);
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
    await waitFor(() => {
      expect(ref.current?.state.processingTitle).toEqual(false);
      expect(ref.current?.state.processingColor).toEqual(false);
    });
  });

  it("doesn't generate name and color", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 0;
    p.sequence = sequence;
    const { container } = render(<DesignerSequenceEditor {...p} />);
    fireEvent.click(container.querySelector(".fa-magic") as Element);
    expect(requestAutoGenerationSpy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Save sequence first.");
  });

  it("navigates to full page editor", () => {
    mockIsMobile = false;
    const p = fakeProps();
    const wrapper = renderWithContext(<DesignerSequenceEditor {...p} />);
    fireEvent.click(wrapper.container.querySelector(".fa-expand") as Element);
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
    const { container } = render(<ResourceTitle {...fakeProps()} />);
    const span = container.querySelector("span") as HTMLSpanElement;
    expect(span.style.pointerEvents).toEqual("");
    fireEvent.click(span);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(editSpy).toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("saves change", () => {
    const p = fakeProps();
    p.save = true;
    const { container } = render(<ResourceTitle {...p} />);
    fireEvent.click(container.querySelector("span") as Element);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.blur(input);
    expect(editSpy).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalled();
  });

  it("is read-only", () => {
    const p = fakeProps();
    p.readOnly = true;
    const { container } = render(<ResourceTitle {...p} />);
    expect((container.querySelector("span") as HTMLSpanElement).style.pointerEvents)
      .toEqual("none");
  });
});
