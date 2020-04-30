import * as React from "react";
import { TileIf } from "../tile_if";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { If, Wait } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileIf />", () => {
  const fakeProps = (): StepParams => {
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
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: emptyState().index,
      confirmStepDeletion: false,
      showPins: true,
    };
  };

  it("renders if step", () => {
    const wrapper = mount(<TileIf {...fakeProps()} />);
    ["Variable", "Operator", "Value", "Then Execute", "Else Execute"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("doesn't render if step", () => {
    const p = fakeProps();
    const waitStep: Wait = { kind: "wait", args: { milliseconds: 0 } };
    p.currentStep = waitStep;
    const wrapper = mount(<TileIf {...p} />);
    expect(wrapper.text()).toEqual("Expected `_if` node");
  });
});
