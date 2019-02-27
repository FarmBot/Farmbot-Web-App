import * as React from "react";
import { TileSystemAction } from "../tile_system_action";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Sync } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileSystemAction/>", () => {
  const currentStep: Sync = {
    kind: "sync",
    args: {}
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
    const block = mount(<TileSystemAction {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(1);
    expect(labels.length).toEqual(0);
    expect(inputs.first().props().placeholder).toEqual("Sync");
  });
});
