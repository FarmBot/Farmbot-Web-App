import React from "react";
import { TileIf } from "../tile_if";
import { render } from "@testing-library/react";
import { If } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileIf />", () => {
  const fakeProps = (): StepParams<If> => {
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
  };

  it("renders if step", () => {
    const { container } = render(<TileIf {...fakeProps()} />);
    const text = container.textContent || "";
    ["Variable", "Operator", "Value", "Then Execute", "Else Execute"]
      .map(string => expect(text).toContain(string));
  });
});
