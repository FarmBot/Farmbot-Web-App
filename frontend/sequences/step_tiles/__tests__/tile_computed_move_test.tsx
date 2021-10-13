import React from "react";
import { TileComputedMove } from "../tile_computed_move";
import { mount } from "enzyme";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { Move } from "farmbot";
import { StepParams } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

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
      ...fakeStepParams(currentStep),
      resources: buildResourceIndex([plant]).index,
    };
  };

  it("renders move step", () => {
    const wrapper = mount(<TileComputedMove {...fakeProps()} />);
    ["Location"]
      .map(string => expect(wrapper.text()).toContain(string));
  });
});
