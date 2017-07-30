import * as React from "react";
import { TileTakePhoto } from "../tile_take_photo";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { TakePhoto } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileTakePhoto/>", () => {
  function bootstrapTest() {
    const currentStep: TakePhoto = {
      kind: "take_photo",
      args: {}
    };
    return {
      component: mount(<TileTakePhoto
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        sequences={[]}
        tools={[]}
        slots={[]}
        resources={emptyState().index} />)
    };
  }

  it("renders inputs", () => {
    let block = bootstrapTest().component;
    let inputs = block.find("input");
    expect(inputs.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Take a Photo");
    expect(block.text()).toContain("farmware page");
  });
});
