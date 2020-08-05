import * as React from "react";
import { TileComputedMove } from "../tile_computed_move";
import { mount } from "enzyme";
import {
  fakeSequence, fakePlant,
} from "../../../__test_support__/fake_state/resources";
import { Move, Wait } from "farmbot/dist";
import { StepParams } from "../../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<TileComputedMove />", () => {
  const fakeProps = (): StepParams => {
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
      confirmStepDeletion: false,
    };
  };

  it("renders move step", () => {
    const wrapper = mount(<TileComputedMove {...fakeProps()} />);
    ["Location"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("doesn't render move step", () => {
    const p = fakeProps();
    const waitStep: Wait = { kind: "wait", args: { milliseconds: 0 } };
    p.currentStep = waitStep;
    const wrapper = mount(<TileComputedMove {...p} />);
    expect(wrapper.text()).toEqual("Expected `move` node");
  });
});
