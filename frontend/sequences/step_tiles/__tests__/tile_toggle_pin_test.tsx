import * as React from "react";
import { TileTogglePin } from "../tile_toggle_pin";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { TogglePin } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileTogglePin/>", () => {
  const currentStep: TogglePin = {
    kind: "toggle_pin",
    args: {
      pin_number: 13
    }
  };

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
  });

  it("renders inputs", () => {
    const block = mount(<TileTogglePin {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Toggle Pin");
    expect(labels.at(0).text()).toContain("Pin");
    expect(inputs.at(1).props().value).toEqual(13);
  });
});
