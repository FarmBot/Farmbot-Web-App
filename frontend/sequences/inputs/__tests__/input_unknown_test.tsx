import React from "react";
import { shallow } from "enzyme";
import { InputUnknown } from "../input_unknown";
import { StepInputProps } from "../../interfaces";
import { LegalArgString } from "farmbot";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<InputUnknown />", () => {
  const fakeProps = (): StepInputProps => ({
    index: 0,
    field: "x",
    step: { kind: "sync", args: {} },
    dispatch: jest.fn(),
    sequence: fakeSequence(),
  });

  it("renders input box for unknown field", () => {
    const p = fakeProps();
    const wrapper = shallow(<InputUnknown {...p} />);
    expect(wrapper.find("input").props().placeholder)
      .toEqual("UNEXPECTED INPUT 'x'");
  });

  it("renders input box for missing field", () => {
    const p = fakeProps();
    p.field = undefined as unknown as LegalArgString;
    const wrapper = shallow(<InputUnknown {...p} />);
    expect(wrapper.find("input").props().placeholder)
      .toEqual("UNEXPECTED INPUT 'empty'");
  });
});
