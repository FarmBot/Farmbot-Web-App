jest.mock("../../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { render } from "@testing-library/react";
import { If_ } from "../if";
import { If } from "farmbot";
import { overwrite } from "../../../../api/crud";
import { StepParams } from "../../../interfaces";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

afterAll(() => {
  jest.unmock("../../../../api/crud");
});
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
    const { container } = render(<If_ {...fakeProps()} />);
    ["Variable", "Operator", "Value"].map(string =>
      expect(container.textContent).toContain(string));
    expect(container.querySelectorAll("button").length).toEqual(2);
    expect(container.querySelectorAll("input").length).toEqual(1);
  });

  it("updates op", () => {
    const wrapper = If_(fakeProps());
    const children =
      React.Children.toArray(wrapper.props.children) as JSX.Element[];
    const operatorChildren = React.Children.toArray(
      (children[1] as JSX.Element).props.children) as JSX.Element[];
    const operatorInput = operatorChildren[1] as JSX.Element;
    operatorInput.props.onChange({
      label: "is not", value: "not"
    });
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        body: [{ kind: "_if", args: expect.objectContaining({ op: "not" }) }]
      }));
  });
});
