import * as React from "react";
import { TileWait } from "../tile_wait";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { Wait } from "farmbot";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";

describe("<TileWait/>", () => {
  const currentStep: Wait = {
    kind: "wait",
    args: {
      milliseconds: 100
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
    const block = mount(<TileWait {...fakeProps()} />);
    const inputs = block.find("input");
    const labels = block.find("label");
    expect(inputs.length).toEqual(2);
    expect(labels.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Wait");
    expect(labels.at(0).text()).toEqual("Time in milliseconds");
    expect(inputs.at(1).props().value).toEqual(100);
  });
});
