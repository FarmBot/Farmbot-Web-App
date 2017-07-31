import * as React from "react";
import { TileWritePin } from "../tile_write_pin";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { WritePin } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileWritePin/>", () => {
  function bootstrapTest() {
    const currentStep: WritePin = {
      kind: "write_pin",
      args: {
        pin_number: 3,
        pin_value: 2,
        pin_mode: 1
      }
    };
    return {
      component: mount(<TileWritePin
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
    let labels = block.find("label");
    expect(inputs.length).toEqual(4);
    expect(labels.length).toEqual(3);
    expect(inputs.first().props().placeholder).toEqual("Write Pin");
    expect(labels.at(0).text()).toEqual("Pin Number");
    expect(inputs.at(1).props().value).toEqual(3);
    expect(labels.at(1).text()).toEqual("Value");
    expect(inputs.at(2).props().value).toEqual(2);
    expect(labels.at(2).text()).toEqual("Pin Mode");
    expect(inputs.at(3).props().value).toEqual(1);
  });
});
