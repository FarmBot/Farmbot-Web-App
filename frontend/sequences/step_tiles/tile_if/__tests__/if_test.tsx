jest.mock("../../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { If_ } from "../if";
import { If } from "farmbot";
import { FBSelect } from "../../../../ui";
import { overwrite } from "../../../../api/crud";
import { StepParams } from "../../../interfaces";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

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
      ...fakeStepParams(currentStep),
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
