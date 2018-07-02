import * as React from "react";
import { TileWait } from "../tile_wait";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Wait } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileWait/>", () => {
  function bootstrapTest() {
    const currentStep: Wait = {
      kind: "wait",
      args: {
        milliseconds: 100
      }
    };
    return {
      component:mount<>(<TileWait
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
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Wait");
    expect(labels.at(0).text()).toEqual("Time in milliseconds");
    expect(inputs.at(1).props().value).toEqual(100);
  });
});
