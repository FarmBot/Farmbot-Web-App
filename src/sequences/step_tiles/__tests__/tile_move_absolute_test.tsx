import * as React from "react";
import { TileMoveAbsolute } from "../tile_move_absolute";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { MoveAbsolute } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileMoveAbsolute/>", () => {
  function bootstrapTest() {
    const currentStep: MoveAbsolute = {
      kind: "move_absolute",
      args: {
        location: {
          kind: "coordinate",
          args: {
            x: 1,
            y: 2,
            z: 3
          }
        },
        speed: 100,
        offset: {
          kind: "coordinate",
          args: {
            x: 4,
            y: 5,
            z: 6
          }
        }
      }
    };
    return {
      component: mount(<TileMoveAbsolute
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        sequences={[]}
        tools={[]}
        slots={[]}
        resources={emptyState().index} />)
    };
  }

  it("renders inputs", () => {
    let block = bootstrapTest().component;
    let inputs = block.find("input");
    let labels = block.find("label");
    let buttons = block.find("button");
    expect(inputs.length).toEqual(7);
    expect(labels.length).toEqual(7);
    expect(buttons.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Move Absolute");
    expect(labels.at(0).text().toLowerCase()).toEqual("import coordinates from");
    expect(buttons.at(0).text()).toEqual("None");
    expect(labels.at(1).text().toLowerCase()).toEqual("x (mm)");
    expect(inputs.at(1).props().value).toEqual("1");
    expect(labels.at(2).text().toLowerCase()).toEqual("y (mm)");
    expect(inputs.at(2).props().value).toEqual("2");
    expect(labels.at(3).text().toLowerCase()).toEqual("z (mm)");
    expect(inputs.at(3).props().value).toEqual("3");
    expect(labels.at(4).text().toLowerCase()).toEqual("x-offset");
    expect(inputs.at(4).props().value).toEqual("4");
    expect(labels.at(5).text().toLowerCase()).toEqual("y-offset");
    expect(inputs.at(5).props().value).toEqual("5");
    expect(labels.at(6).text().toLowerCase()).toEqual("z-offset");
    expect(inputs.at(6).props().value).toEqual("6");
  });
});
