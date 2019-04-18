import * as React from "react";
import { If_ } from "../if";
import { mount } from "enzyme";
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { If } from "farmbot/dist";
import { IfParams } from "../index";
import { emptyState } from "../../../../resources/reducer";

describe("<If_/>", () => {
  function fakeProps(): IfParams {
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
      shouldDisplay: jest.fn(),
      confirmStepDeletion: false,
      showPins: true,
    };
  }

  it("renders", () => {
    const wrapper = mount(<If_ {...fakeProps()} />);
    ["Variable", "Operator", "Value"].map(string =>
      expect(wrapper.text()).toContain(string));
    expect(wrapper.find("button").length).toEqual(2);
    expect(wrapper.find("input").length).toEqual(1);
  });
});
