import * as React from "react";
import { TileSetZero } from "../tile_set_zero";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Zero } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileSetZero/>", () => {
  const currentStep: Zero = {
    kind: "zero",
    args: {
      axis: "all"
    }
  };

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
  });

  it("renders inputs", () => {
    const block = mount(<TileSetZero {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Set zero");
    expect(labels.at(0).text()).toContain("Zero x");
    expect(inputs.at(1).props().value).toEqual("x");
  });
});
