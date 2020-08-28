import React from "react";
import { TileMoveHome } from "../tile_move_home";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Home } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileMoveHome/>", () => {
  const fakeProps = (): StepParams<Home> => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "home", args: { axis: "all", speed: 100 } },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
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
