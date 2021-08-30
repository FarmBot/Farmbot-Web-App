import React from "react";
import { mount } from "enzyme";
import { TileSystemAction } from "../tile_system_action";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { Sync } from "farmbot";

describe("<TileSystemAction/>", () => {
  const fakeProps = (): StepParams<Sync> => ({
    ...fakeStepParams({ kind: "sync", args: {} }),
  });

  it("renders inputs", () => {
    const block = mount(<TileSystemAction {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(0);
    expect(inputs.first().props().placeholder).toEqual("Sync");
  });
});
