import React from "react";
import { render } from "@testing-library/react";
import { If_ } from "../if";
import { If } from "farmbot";
import * as crud from "../../../../api/crud";
import { StepParams } from "../../../interfaces";
import {
  fakeStepParams,
} from "../../../../__test_support__/fake_sequence_step_data";

let overwriteSpy: jest.SpyInstance;

beforeEach(() => {
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
});

afterEach(() => {
  overwriteSpy.mockRestore();
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
    const wrapper = If_(fakeProps()) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as JSX.Element[];
    expect(children.length).toEqual(3);
  });

  it("updates op", () => {
    const wrapper = If_(fakeProps()) as React.ReactElement<{ children?: React.ReactNode }>;
    const children =
      React.Children.toArray(wrapper.props.children) as JSX.Element[];
    const operatorChildren = React.Children.toArray(
      (children[1] as React.ReactElement<{ children?: React.ReactNode }>).props.children,
    ) as JSX.Element[];
    const operatorInput = operatorChildren[1];
    operatorInput.props.onChange({
      label: "is not", value: "not"
    });
    expect(overwriteSpy).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({
        body: [{ kind: "_if", args: expect.objectContaining({ op: "not" }) }]
      }));
  });
});
