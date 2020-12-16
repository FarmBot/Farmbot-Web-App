const mockUpdateArg = jest.fn();
jest.mock("../../step_tiles", () => ({ updateStep: jest.fn(() => mockUpdateArg) }));

import React from "react";
import { mount, shallow } from "enzyme";
import { InputDefault } from "../input_default";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { StepInputProps } from "../../interfaces";
import { updateStep } from "../../step_tiles";
import { Wait } from "farmbot";

describe("<InputDefault />", () => {
  const fakeProps = (): StepInputProps => ({
    index: 0,
    field: "milliseconds",
    step: { kind: "wait", args: { milliseconds: 0 } },
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("renders arg value", () => {
    const p = fakeProps();
    const wrapper = mount(<InputDefault {...p} />);
    expect(wrapper.find("input").props().value).toEqual(0);
  });

  it("doesn't render bad arg value type", () => {
    const p = fakeProps();
    (p.step as Wait).args.milliseconds = false as unknown as number;
    const wrapper = mount(<InputDefault {...p} />);
    expect(wrapper.find("input").props().value).toEqual("");
  });

  it("updates the step", () => {
    const p = fakeProps();
    const wrapper = shallow(<InputDefault {...p} />);
    const e = { currentTarget: { value: "100" } };
    wrapper.find("BlurableInput").simulate("commit", e);
    expect(updateStep).toHaveBeenCalledTimes(1);
    expect(updateStep).toHaveBeenCalledWith(p);
    expect(mockUpdateArg).toHaveBeenCalledWith(e);
  });
});
