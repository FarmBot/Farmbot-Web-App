import * as React from "react";
import { TileReadPin } from "../tile_read_pin";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { ReadPin } from "farmbot/dist";
import { emptyState } from "../../../resources/reducer";

describe("<TileReadPin/>", () => {
  function bootstrapTest() {
    const currentStep: ReadPin = {
      kind: "read_pin",
      args: {
        pin_number: 3,
        label: "pinlabel",
        pin_mode: 1
      }
    };
    return {
      component: mount<{}>(<TileReadPin
        currentSequence={fakeSequence()}
        currentStep={currentStep}
        dispatch={jest.fn()}
        index={0}
        resources={emptyState().index} />)
    };
  }

  it("renders inputs", () => {
    const block = bootstrapTest().component;
    const inputs = block.find("input");
    const labels = block.find("label");
    const buttons = block.find("button");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(3);
    expect(buttons.length).toEqual(2);
    expect(inputs.first().props().placeholder).toEqual("Read Pin");
    expect(labels.at(0).text()).toEqual("Pin");
    expect(labels.at(1).text()).toEqual("Data Label");
    expect(inputs.at(1).props().value).toEqual("pinlabel");
    expect(labels.at(2).text()).toEqual("Pin Mode");
    expect(buttons.at(0).text()).toEqual("Pin 3");
  });
});
