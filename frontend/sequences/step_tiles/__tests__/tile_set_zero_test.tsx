import React from "react";
import { mount } from "enzyme";
import { TileSetZero } from "../tile_set_zero";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Zero } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileSetZero/>", () => {
  const fakeProps = (): StepParams<Zero> => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "zero", args: { axis: "all" } },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
  });

  it("renders inputs", () => {
    const block = mount(<TileSetZero {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Set home");
    expect(labels.at(0).text()).toContain("x");
    expect(inputs.at(1).props().value).toEqual("x");
  });
});
