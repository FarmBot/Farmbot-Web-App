import React from "react";
import { TileComputedMove } from "../tile_computed_move";
import { mount } from "enzyme";
import {
  fakeSequence, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { Move } from "farmbot/dist";
import { StepParams } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<TileComputedMove />", () => {
  const fakeProps = (): StepParams<Move> => {
    const currentStep: Move = {
      kind: "move",
      args: {},
      body: [{
        kind: "axis_overwrite",
        args: {
          axis: "x", axis_operand: {
            kind: "point",
            args: { pointer_type: "Plant", pointer_id: 1 }
          }
        }
      }],
    };
    const plant = fakePlant();
    plant.body.id = 1;
    return {
      currentSequence: fakeSequence(),
      currentStep: currentStep,
      dispatch: jest.fn(),
      index: 0,
      resources: buildResourceIndex([plant]).index,
    };
  };

  it("renders move step", () => {
    const wrapper = mount(<TileComputedMove {...fakeProps()} />);
    ["Location"]
      .map(string => expect(wrapper.text()).toContain(string));
  });
});
