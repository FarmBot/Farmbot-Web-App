import React from "react";
import { mount, shallow } from "enzyme";
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

  it("renders", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    expect(wrapper.find(".step-control-icons").length).toEqual(1);
    expect(wrapper.find(".fa-trash").length).toEqual(1);
    expect(wrapper.find(".fa-clone").length).toEqual(1);
    expect(wrapper.find(StepUpDownButtonPopover).length).toEqual(1);
  });

  it("renders monaco editor enabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.monacoEditor]: { enabled: true, toggle: () => false }
    };
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-font").hasClass("active")).toEqual(false);
  });

  it("renders monaco editor disabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.monacoEditor]: { enabled: false, toggle: () => true }
    };
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-font").hasClass("active")).toEqual(true);
  });

  it("renders expanded editor enabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.luaExpanded]: { enabled: true, toggle: () => false }
    };
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-expand").length).toEqual(0);
    expect(wrapper.find(".fa-compress").length).toEqual(1);
  });

  it("renders expanded editor disabled", () => {
    const p = fakeProps();
    p.stateToggles = {
      [StateToggleKey.luaExpanded]: { enabled: false, toggle: () => true }
    };
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-expand").length).toEqual(1);
    expect(wrapper.find(".fa-compress").length).toEqual(0);
  });

  it("renders celery script view enabled", () => {
    const p = fakeProps();
    p.viewRaw = true;
    p.toggleViewRaw = () => false;
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-code").hasClass("active")).toEqual(true);
  });

  it("renders prompt", () => {
    const p = fakeProps();
    p.step.kind = "lua";
    p.readOnly = false;
    p.isProcessing = false;
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-magic").length).toEqual(1);
  });

  it("renders celery script view disabled", () => {
    const p = fakeProps();
    p.viewRaw = false;
    p.toggleViewRaw = () => true;
    const wrapper = mount(<StepIconGroup {...p} />);
    expect(wrapper.find(".fa-code").hasClass("active")).toEqual(false);
  });

  it("deletes step", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(stepTiles.remove)
      .toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  });

  it("duplicates step", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    wrapper.find(".fa-clone").first().simulate("click");
    expect(stepTiles.splice).toHaveBeenCalledWith(expect.objectContaining({
      index: 0,
      step: fakeProps().step
    }));
  });

  it("moves step", () => {
    const wrapper = shallow(<StepIconGroup {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.find("StepUpDownButtonPopover").props() as any).onMove(-1)();
    expect(stepTiles.move).toHaveBeenCalledWith(expect.objectContaining({
      from: 0,
      to: 0,
      step: fakeProps().step
    }));
  });

  it("navigates to sequence", () => {
    const p = fakeProps();
    p.executeSequenceName = "My Sequence";
    const wrapper = mount(<StepIconGroup {...p} />);
    wrapper.find(".fa-external-link").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.sequences("My_Sequence"));
  });
});
