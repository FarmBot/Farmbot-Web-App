import * as React from "react";
import { TileFindHome } from "../tile_find_home";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { FindHome } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileFindHome/>", () => {
  function bootstrapTest() {
    const currentStep: FindHome = {
      kind: "find_home",
      args: {
        speed: 100,
        axis: "all"
      }
    };
    return {
      component: mount(<TileFindHome
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        resources={emptyState().index} />)
    };
  }

  it("renders inputs", () => {
    let block = bootstrapTest().component;
    let inputs = block.find("input");
    let labels = block.find("label");
    expect(inputs.length).toEqual(5);
    expect(labels.length).toEqual(4);
    expect(inputs.first().props().placeholder).toEqual("Find Home");
    expect(labels.at(0).text()).toContain("Find x");
    expect(inputs.at(1).props().checked).toBeFalsy();
    expect(labels.at(1).text()).toContain("Find y");
    expect(inputs.at(2).props().checked).toBeFalsy();
    expect(labels.at(2).text()).toContain("Find z");
    expect(inputs.at(3).props().checked).toBeFalsy();
    expect(labels.at(3).text()).toContain("Find all");
    expect(inputs.at(4).props().checked).toBeTruthy();
  });
});
