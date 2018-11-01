import * as React from "react";
import { TileMoveRelative } from "../tile_move_relative";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { MoveRelative } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileMoveRelative/>", () => {
  function bootstrapTest() {
    const currentStep: MoveRelative = {
      kind: "move_relative",
      args: {
        x: 1.1,
        y: 2,
        z: 3,
        speed: 100
      }
    };
    return {
      component: mount(<TileMoveRelative
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        resources={emptyState().index}
        confirmStepDeletion={false} />)
    };
  }

  it("renders inputs", () => {
    const block = bootstrapTest().component;
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Move Relative");
    expect(labels.at(0).text().toLowerCase()).toEqual("x (mm)");
    expect(inputs.at(1).props().value).toEqual(1.1);
    expect(labels.at(1).text().toLowerCase()).toEqual("y (mm)");
    expect(inputs.at(2).props().value).toEqual(2);
    expect(labels.at(2).text().toLowerCase()).toEqual("z (mm)");
    expect(inputs.at(3).props().value).toEqual(3);
    expect(labels.at(3).text().toLowerCase()).toEqual("speed (%)");
    expect(inputs.at(4).props().value).toEqual(100);
  });
});
