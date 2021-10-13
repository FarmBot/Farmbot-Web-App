import React from "react";
import { mount } from "enzyme";
import { ThenElse } from "../then_else";
import { If } from "farmbot";
import { ThenElseParams } from "../index";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

describe("<ThenElse/>", () => {
  function fakeProps(): ThenElseParams {
    const currentStep: If = {
      kind: "_if",
      args: {
        lhs: "pin0",
        op: "is",
        rhs: 0,
        _then: { kind: "nothing", args: {} },
        _else: { kind: "nothing", args: {} }
      }
    };
    return {
      ...fakeStepParams(currentStep),
      thenElseKey: "_then",
    };
  }

  it("renders 'then'", () => {
    const wrapper = mount(<ThenElse {...fakeProps()} />);
    expect(wrapper.text()).toContain("Then Execute");
    expect(wrapper.find("button").length).toEqual(1);
  });

  it("renders 'else'", () => {
    const p = fakeProps();
    p.thenElseKey = "_else";
    const wrapper = mount(<ThenElse {...p} />);
    expect(wrapper.text()).toContain("Else Execute");
    expect(wrapper.find("button").length).toEqual(1);
  });
});
