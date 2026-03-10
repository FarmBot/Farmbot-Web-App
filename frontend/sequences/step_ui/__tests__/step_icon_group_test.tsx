import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  StepIconGroup, StepIconBarProps, StepUpDownButtonPopover,
} from "../step_icon_group";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import * as stepTiles from "../../step_tiles";
import { Path } from "../../../internal_urls";
import { emptyState } from "../../../resources/reducer";
import { StateToggleKey } from "../step_wrapper";

let spliceSpy: jest.SpyInstance;
let removeSpy: jest.SpyInstance;
let moveSpy: jest.SpyInstance;

beforeEach(() => {
  spliceSpy = jest.spyOn(stepTiles, "splice").mockImplementation(jest.fn());
  removeSpy = jest.spyOn(stepTiles, "remove").mockImplementation(jest.fn());
  moveSpy = jest.spyOn(stepTiles, "move").mockImplementation(jest.fn());
});

afterEach(() => {
  spliceSpy.mockRestore();
  removeSpy.mockRestore();
  moveSpy.mockRestore();
});

describe("<StepIconGroup />", () => {
  const fakeProps = (): StepIconBarProps => ({
    index: 0,
    dispatch: jest.fn(),
    readOnly: false,
    step: { kind: "wait", args: { milliseconds: 100 } },
    sequence: fakeSequence(),
    executeSequenceName: undefined,
    viewRaw: undefined,
    toggleViewRaw: undefined,
    links: undefined,
    helpText: "helpful text",
    confirmStepDeletion: false,
    isProcessing: false,
    togglePrompt: jest.fn(),
    sequencesState: emptyState().consumers.sequences,
  });

  const getMovePopover = (props: StepIconBarProps) => {
    const wrapper =
      StepIconGroup(props) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as
      JSX.Element[];
    return children.find(child =>
      child.type === StepUpDownButtonPopover) as JSX.Element;
  };

  it("renders", () => {
    const { container } = render(<StepIconGroup {...fakeProps()} />);
    expect(container.querySelectorAll(".step-control-icons").length).toEqual(1);
    expect(container.querySelectorAll(".fa-trash").length).toEqual(1);
    expect(container.querySelectorAll(".fa-clone").length).toEqual(1);
    expect(container.querySelectorAll(".fa-arrows-v").length).toEqual(1);
  });

  it("renders monaco editor enabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.monacoEditor]: { enabled: true, toggle: () => false }
    };
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelector(".fa-font")?.classList.contains("active"))
      .toEqual(false);
  });

  it("renders monaco editor disabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.monacoEditor]: { enabled: false, toggle: () => true }
    };
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelector(".fa-font")?.classList.contains("active"))
      .toEqual(true);
  });

  it("renders expanded editor enabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.luaExpanded]: { enabled: true, toggle: () => false }
    };
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelectorAll(".fa-expand").length).toEqual(0);
    expect(container.querySelectorAll(".fa-compress").length).toEqual(1);
  });

  it("renders expanded editor disabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.luaExpanded]: { enabled: false, toggle: () => true }
    };
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelectorAll(".fa-expand").length).toEqual(1);
    expect(container.querySelectorAll(".fa-compress").length).toEqual(0);
  });

  it("renders celery script view enabled", () => {
    const p = fakeProps();
    p.viewRaw = true;
    p.toggleViewRaw = () => false;
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelector(".fa-code")?.classList.contains("active"))
      .toEqual(true);
  });

  it("renders prompt", () => {
    const p = fakeProps();
    p.step.kind = "lua";
    p.readOnly = false;
    p.isProcessing = false;
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelectorAll(".fa-magic").length).toEqual(1);
  });

  it("renders celery script view disabled", () => {
    const p = fakeProps();
    p.viewRaw = false;
    p.toggleViewRaw = () => true;
    const { container } = render(<StepIconGroup {...p} />);
    expect(container.querySelector(".fa-code")?.classList.contains("active"))
      .toEqual(false);
  });

  it("deletes step", () => {
    const { container } = render(<StepIconGroup {...fakeProps()} />);
    const icon = container.querySelector(".fa-trash");
    if (!icon) { throw new Error("Expected trash icon"); }
    fireEvent.click(icon);
    expect(stepTiles.remove)
      .toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  });

  it("duplicates step", () => {
    const { container } = render(<StepIconGroup {...fakeProps()} />);
    const icon = container.querySelector(".fa-clone");
    if (!icon) { throw new Error("Expected clone icon"); }
    fireEvent.click(icon);
    expect(stepTiles.splice).toHaveBeenCalledWith(expect.objectContaining({
      index: 0,
      step: fakeProps().step
    }));
  });

  it("moves step", () => {
    getMovePopover(fakeProps()).props.onMove(-1)();
    expect(stepTiles.move).toHaveBeenCalledWith(expect.objectContaining({
      from: 0,
      to: 0,
      step: fakeProps().step
    }));
  });

  it("navigates to sequence", () => {
    const p = fakeProps();
    p.executeSequenceName = "My Sequence";
    const { container } = render(<StepIconGroup {...p} />);
    const icon = container.querySelector(".fa-external-link");
    if (!icon) { throw new Error("Expected sequence-link icon"); }
    fireEvent.click(icon);
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequences("My_Sequence"));
  });
});
