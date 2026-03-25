import React from "react";
import { render } from "@testing-library/react";
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
    const p = fakeProps();
    const { container } = render(<ThenElse {...p} />);
    const wrapper = ThenElse(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ list?: unknown[] }>[];
    expect(container.textContent).toContain("Then Execute");
    expect(children.length).toBeGreaterThanOrEqual(2);
    expect((children[1]).props.list).toBeDefined();
  });

  it("renders 'else'", () => {
    const p = fakeProps();
    p.thenElseKey = "_else";
    const { container } = render(<ThenElse {...p} />);
    const wrapper = ThenElse(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const children = React.Children.toArray(wrapper.props.children) as
      React.ReactElement<{ list?: unknown[] }>[];
    expect(container.textContent).toContain("Else Execute");
    expect(children.length).toBeGreaterThanOrEqual(2);
    expect((children[1]).props.list).toBeDefined();
  });
});
