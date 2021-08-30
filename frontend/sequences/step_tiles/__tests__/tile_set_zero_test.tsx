import React from "react";
import { mount } from "enzyme";
import { TileSetZero } from "../tile_set_zero";
import { Zero } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileSetZero/>", () => {
  const fakeProps = (): StepParams<Zero> => ({
    ...fakeStepParams({ kind: "zero", args: { axis: "all" } }),
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
