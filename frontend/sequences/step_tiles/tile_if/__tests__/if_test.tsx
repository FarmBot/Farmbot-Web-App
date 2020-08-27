jest.mock("../../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { If_ } from "../if";
import { fakeSequence } from "../../../../__test_support__/fake_state/resources";
import { If } from "farmbot/dist";
import { emptyState } from "../../../../resources/reducer";
import { FBSelect } from "../../../../ui";
import { overwrite } from "../../../../api/crud";
import { StepParams } from "../../../interfaces";

describe("<If_/>", () => {
  function fakeProps(): StepParams<If> {
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

  it("updates op", () => {
    const wrapper = shallow(<If_ {...fakeProps()} />);
    wrapper.find(FBSelect).last().simulate("change", {
      label: "is not", value: "not"
    });
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        body: [{ kind: "_if", args: expect.objectContaining({ op: "not" }) }]
      }));
  });
});
