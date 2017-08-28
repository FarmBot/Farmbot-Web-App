import * as React from "react";
import { ExecuteBlock } from "../tile_execute";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Execute } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<ExecuteBlock/>", () => {
  function bootstrapTest() {
    const currentStep: Execute = {
      kind: "execute",
      args: {
        sequence_id: 0
      }
    };
    return {
      component: mount(<ExecuteBlock
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        resources={emptyState().index} />)
    };
  }

  it("renders inputs", () => {
    const block = bootstrapTest().component;
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Execute Sequence");
    expect(labels.at(0).text()).toEqual("Sequence");
    expect(block.text()).toContain("None");
  });
});
