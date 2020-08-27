import React from "react";
import { TileTogglePin } from "../tile_toggle_pin";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";
import { TogglePin } from "farmbot";

describe("<TileTogglePin/>", () => {
  const fakeProps = (): StepParams<TogglePin> => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "toggle_pin", args: { pin_number: 13 } },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
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
