let mockHasParameters = false;

import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { TestButton, TestBtnProps, setMenuOpen } from "../test_button";
import {
  SpecialStatus, ParameterApplication, ParameterDeclaration, Coordinate,
} from "farmbot";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { warning } from "../../toast/toast";
import { fakeVariableNameSet } from "../../__test_support__/fake_variables";
import { SequenceMeta } from "../../resources/sequence_meta";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { fakeMenuOpenState } from "../../__test_support__/fake_designer_state";
import * as deviceActions from "../../devices/actions";
import * as isParameterizedModule from "../locals_list/is_parameterized";

jest.mock("../../ui", () => ({
  ...jest.requireActual("../../ui"),
  Popover: (props: {
    className?: string;
    target: React.ReactNode;
    content?: React.ReactNode;
    isOpen?: boolean;
  }) => <div className={props.className}>
    {props.target}
    {props.isOpen && props.content}
  </div>,
}));

describe("<TestButton />", () => {
  let execSequenceSpy: jest.SpyInstance;
  let isParameterizedSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHasParameters = false;
    isParameterizedSpy = jest.spyOn(isParameterizedModule, "isParameterized")
      .mockImplementation(() => mockHasParameters);
    execSequenceSpy = jest.spyOn(deviceActions, "execSequence")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    isParameterizedSpy.mockRestore();
    execSequenceSpy.mockRestore();
    document.body.innerHTML = "";
  });

  const fakeProps = (): TestBtnProps => ({
    sequence: fakeSequence(),
    syncStatus: "synced",
    resources: buildResourceIndex().index,
    menuOpen: fakeMenuOpenState(),
    dispatch: jest.fn(),
    component: "list",
  });

  it("doesn't fire if unsaved", () => {
    const props = fakeProps();
    props.sequence.specialStatus = SpecialStatus.DIRTY;
    const { container } = render(<TestButton {...props} />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(btn.classList.contains("pseudo-disabled")).toBeTruthy();
    expect(warning).toHaveBeenCalled();
    expect(deviceActions.execSequence).not.toHaveBeenCalled();
  });

  it("doesn't fire if unsynced", () => {
    const props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const { container } = render(<TestButton {...props} />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(btn.classList.contains("pseudo-disabled")).toBeTruthy();
    expect(warning).toHaveBeenCalled();
    expect(deviceActions.execSequence).not.toHaveBeenCalled();
  });

  it("does fire if saved and synced", () => {
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const { container } = render(<TestButton {...props} />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(btn.classList.contains("orange")).toBeTruthy();
    expect(warning).not.toHaveBeenCalled();
    expect(deviceActions.execSequence)
      .toHaveBeenCalledWith(props.sequence.body.id);
  });

  it("opens parameter assignment menu", () => {
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    mockHasParameters = true;
    const { container } = render(<TestButton {...props} />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(btn.classList.contains("orange")).toBeTruthy();
    expect(warning).not.toHaveBeenCalled();
    expect(deviceActions.execSequence).not.toHaveBeenCalled();
    expect(props.dispatch).toHaveBeenCalledWith(setMenuOpen({
      component: "list", uuid: props.sequence.uuid,
    }));
  });

  it("has open parameter assignment menu", () => {
    const props = fakeProps();
    mockHasParameters = true;
    props.menuOpen.component = "list";
    props.menuOpen.uuid = props.sequence.uuid;
    const { container } = render(<TestButton {...props} />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.classList.contains("gray")).toBeTruthy();
    expect(btn.textContent).toEqual("Close");
    expect(container.querySelector(".parameter-assignment-menu")).toBeTruthy();
  });

  it("closes parameter assignment menu", () => {
    const p = fakeProps();
    p.menuOpen.component = "list";
    p.menuOpen.uuid = p.sequence.uuid;
    p.syncStatus = "synced";
    p.sequence.specialStatus = SpecialStatus.SAVED;
    p.sequence.body.id = 1;
    mockHasParameters = true;
    const { container } = render(<TestButton {...p} />);
    const btn = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(btn);
    expect(btn.classList.contains("gray")).toBeTruthy();
    expect(warning).not.toHaveBeenCalled();
    expect(deviceActions.execSequence).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith(setMenuOpen(fakeMenuOpenState()));
  });

  it("edits body variables", () => {
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label", data_value: {
          kind: "coordinate", args: { x: 0, y: 0, z: 0 }
        }
      }
    };
    const props = fakeProps();
    const ref = React.createRef<TestButton>();
    render(<TestButton {...props} ref={ref} />);
    act(() => { ref.current?.editBodyVariables(variable); });
    expect(ref.current?.state.bodyVariables).toEqual([variable]);
  });

  const COORDINATE: Coordinate = {
    kind: "coordinate", args: { x: 0, y: 0, z: 0 }
  };

  it("calls sequence with bodyVariables when synced", () => {
    const declaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: COORDINATE
      }
    };
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    mockHasParameters = true;
    const varData = fakeVariableNameSet("label");
    (varData["label"] as SequenceMeta).celeryNode = declaration;
    props.resources.sequenceMetas[props.sequence.uuid] = varData;
    props.menuOpen.component = "list";
    props.menuOpen.uuid = props.sequence.uuid;
    const { container } = render(<TestButton {...props} />);
    const runButton = container.querySelector(
      ".parameter-assignment-menu .test-button-div button") as Element;
    fireEvent.click(runButton);
    expect(deviceActions.execSequence)
      .toHaveBeenCalledWith(props.sequence.body.id, [{
        kind: "parameter_application",
        args: { label: "label", data_value: COORDINATE }
      },
      ]);
  });

  it("doesn't call sequence with bodyVariables when not synced", () => {
    const declaration: ParameterDeclaration = {
      kind: "parameter_declaration",
      args: {
        label: "label", default_value: COORDINATE
      }
    };
    const props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    mockHasParameters = true;
    const varData = fakeVariableNameSet("label");
    (varData["label"] as SequenceMeta).celeryNode = declaration;
    props.resources.sequenceMetas[props.sequence.uuid] = varData;
    props.menuOpen.component = "list";
    props.menuOpen.uuid = props.sequence.uuid;
    const { container } = render(<TestButton {...props} />);
    const runButton = container.querySelector(
      ".parameter-assignment-menu .test-button-div button") as Element;
    fireEvent.click(runButton);
    expect(deviceActions.execSequence).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalled();
  });

  it("closes menu on unmount", () => {
    const props = fakeProps();
    mockHasParameters = true;
    props.menuOpen.component = "list";
    props.menuOpen.uuid = props.sequence.uuid;
    const { unmount } = render(<TestButton {...props} />);
    unmount();
    expect(props.dispatch).toHaveBeenCalledWith(setMenuOpen(fakeMenuOpenState()));
  });
});
