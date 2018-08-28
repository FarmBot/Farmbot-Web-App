jest.mock("../step_tiles", () => ({
  splice: jest.fn(),
  remove: jest.fn(),
  move: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { StepIconGroup, StepIconBarProps } from "../step_icon_group";
import { fakeSequence } from "../../__test_support__/fake_state/resources";
import { splice, remove, move } from "../step_tiles";

describe("<StepIconGroup />", () => {
  const fakeProps = (): StepIconBarProps => ({
    index: 0,
    dispatch: jest.fn(),
    step: { kind: "wait", args: { milliseconds: 100 } },
    sequence: fakeSequence(),
    helpText: "helpful text",
  });

  it("renders", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    expect(wrapper.find("i").length).toEqual(4);
  });

  it("deletes step", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    wrapper.find("i").at(2).simulate("click");
    expect(remove).toHaveBeenCalledWith(expect.objectContaining({ index: 0 }));
  });

  it("duplicates step", () => {
    const wrapper = mount(<StepIconGroup {...fakeProps()} />);
    wrapper.find("i").at(1).simulate("click");
    expect(splice).toHaveBeenCalledWith(expect.objectContaining({
      index: 0,
      step: fakeProps().step
    }));
  });

  it("moves step", () => {
    const wrapper = shallow(<StepIconGroup {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    (wrapper.find("StepUpDownButtonPopover").props() as any).onMove(-1)();
    expect(move).toHaveBeenCalledWith(expect.objectContaining({
      from: 0,
      to: 0,
      step: fakeProps().step
    }));
  });
});
