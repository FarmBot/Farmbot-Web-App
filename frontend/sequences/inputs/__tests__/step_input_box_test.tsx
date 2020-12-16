import React from "react";
import { shallow } from "enzyme";
import { StepInputBox } from "../step_input_box";
import { StepInputProps } from "../../interfaces";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<StepInputBox />", () => {
  const fakeProps = (): StepInputProps => ({
    index: 0,
    field: "x",
    step: { kind: "sync", args: {} },
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("renders input for known field", () => {
    const p = fakeProps();
    const wrapper = shallow(<StepInputBox {...p} />);
    expect(wrapper.find("InputDefault").length).toEqual(1);
    expect(wrapper.find("InputUnknown").length).toEqual(0);
  });

  it("renders input for unknown field", () => {
    const p = fakeProps();
    p.field = "axis";
    const wrapper = shallow(<StepInputBox {...p} />);
    expect(wrapper.find("InputDefault").length).toEqual(0);
    expect(wrapper.find("InputUnknown").length).toEqual(1);
  });
});
