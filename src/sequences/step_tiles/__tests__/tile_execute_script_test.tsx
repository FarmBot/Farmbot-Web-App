import * as React from "react";
import { TileExecuteScript } from "../tile_execute_script";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { ExecuteScript } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileExecuteScript/>", () => {
  function bootstrapTest() {
    const currentStep: ExecuteScript = {
      kind: "execute_script",
      args: {
        label: "farmware-to-execute"
      }
    };
    return {
      component: mount(<TileExecuteScript
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
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Run Farmware");
    expect(labels.at(0).text()).toEqual("Package Name");
    expect(inputs.at(1).props().value).toEqual("farmware-to-execute");
    expect(inputs.at(1).props().disabled).toBeTruthy();
    expect(block.find("small").text()).toContain("farmware selection");
  });
});
