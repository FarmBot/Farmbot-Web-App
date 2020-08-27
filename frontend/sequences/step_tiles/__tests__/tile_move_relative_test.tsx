import React from "react";
import { TileMoveRelative } from "../tile_move_relative";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileMoveRelative/>", () => {
  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: {
      kind: "move_relative",
      args: {
        x: 1.1,
        y: 2,
        z: 3,
        speed: 100
      }
    },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
  });

  it("renders inputs", () => {
    const block = mount(<TileMoveRelative {...fakeProps()} />);
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
