import React from "react";
import { mount } from "enzyme";
import { TileTogglePin } from "../tile_toggle_pin";
import { StepParams } from "../../interfaces";
import { TogglePin } from "farmbot";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileTogglePin/>", () => {
  const fakeProps = (): StepParams<TogglePin> => ({
    ...fakeStepParams({ kind: "toggle_pin", args: { pin_number: 13 } }),
  });

  it("renders inputs", () => {
    const block = mount(<TileTogglePin {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Toggle Peripheral");
    expect(labels.at(0).text()).toContain("Peripheral");
  });
});
