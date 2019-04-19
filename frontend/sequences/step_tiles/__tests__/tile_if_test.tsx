import * as React from "react";
import { TileIf } from "../tile_if";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { If } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileIf/>", () => {
  function bootstrapTest() {
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
      component: mount(<TileIf
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        resources={emptyState().index}
        confirmStepDeletion={false}
        showPins={true} />)
    };
  }

  it("renders inputs", () => {
    const block = bootstrapTest().component;
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(5);
    expect(buttons.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("If Statement");
    expect(block.text()).toContain("IF...");
    expect(labels.at(0).text()).toEqual("Variable");
    expect(buttons.at(0).text()).toEqual("Pin 0");
    expect(labels.at(1).text()).toEqual("Operator");
    expect(buttons.at(1).text()).toEqual("is");
    expect(labels.at(2).text()).toEqual("Value");
    expect(inputs.at(1).props().value).toEqual(0);
    expect(block.text()).toContain("THEN...");
    expect(labels.at(3).text()).toEqual("Execute Sequence");
    expect(buttons.at(2).text()).toEqual("None");
    expect(block.text()).toContain("ELSE...");
    expect(labels.at(4).text()).toEqual("Execute Sequence");
    expect(buttons.at(3).text()).toEqual("None");
  });
});
