import * as React from "react";
import { TileTakePhoto } from "../tile_take_photo";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { TakePhoto } from "farmbot/dist";
import { StepParams } from "../../interfaces";
import { emptyState } from "../../../resources/reducer";

describe("<TileTakePhoto/>", () => {
  const currentStep: TakePhoto = {
    kind: "take_photo",
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

  it("renders step", () => {
    const wrapper = mount(<TileTakePhoto {...fakeProps()} />);
    expect(wrapper.text().toLowerCase())
      .toEqual("photos are viewable from the farmware page.");
  });

  it("renders inputs", () => {
    const wrapper = mount(<TileTakePhoto {...fakeProps()} />);
    const inputs = wrapper.find("input");
    expect(inputs.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Take a Photo");
    expect(wrapper.text()).toContain("farmware page");
  });
});
