jest.mock("../../step_tiles", () => ({
  splice: jest.fn(),
  remove: jest.fn(),
  move: jest.fn(),
}));

jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
  history: { getCurrentLocation: () => "" },
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { StepIconGroup, StepIconBarProps } from "../step_icon_group";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { splice, remove, move } from "../../step_tiles";
import { push } from "../../../history";

describe("<StepIconGroup />", () => {
  const fakeProps = (): StepIconBarProps => ({
    index: 0,
    dispatch: jest.fn(),
    step: { kind: "wait", args: { milliseconds: 100 } },
    sequence: fakeSequence(),
    executeSequenceName: undefined,
    helpText: "helpful text",
    confirmStepDeletion: false,
  });

  it("renders", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    expect(wrapper.find("i").length).toEqual(4);
  });

  it("deletes step", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    wrapper.find("i").at(1).simulate("click");
    expect(remove).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  });

  it("duplicates step", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    wrapper.find("i").at(2).simulate("click");
    expect(splice).toHaveBeenCalledWith(expect.objectContaining({
      index: 0,
      step: fakeProps().step
    }));
  });

  it("moves step", () => {
    const wrapper = shallow(<StepIconGroup {...fakeProps()} />);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wrapper.find("StepUpDownButtonPopover").props() as any).onMove(-1)();
    expect(move).toHaveBeenCalledWith(expect.objectContaining({
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
    expect(push).toHaveBeenCalledWith("/app/sequences/my_sequence");
  });
});
