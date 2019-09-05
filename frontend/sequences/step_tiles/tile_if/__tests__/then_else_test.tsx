import * as React from "react";
import { ThenElse } from "../then_else";
import { mount } from "enzyme";
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { If } from "farmbot/dist";
import { ThenElseParams } from "../index";
import { emptyState } from "../../../../resources/reducer";

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
      currentSequence: fakeSequence(),
      currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      confirmStepDeletion: false,
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
