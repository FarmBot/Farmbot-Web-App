import React from "react";
import { mount } from "enzyme";
import { TileMoveHome } from "../tile_move_home";
import { Home } from "farmbot";
import { StepParams } from "../../interfaces";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileMoveHome/>", () => {
  const fakeProps = (): StepParams<Home> => ({
    ...fakeStepParams({ kind: "home", args: { axis: "all", speed: 100 } }),
  });

  it("renders inputs", () => {
    const block = mount(<TileMoveHome {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(6);
    expect(labels.length).toEqual(5);
    expect(inputs.first().props().placeholder).toEqual("Move to Home");
    expect(labels.at(0).text()).toContain("x");
    expect(inputs.at(1).props().value).toEqual("x");
  });
});
