import React from "react";
import { mount } from "enzyme";
import { TileTakePhoto } from "../tile_take_photo";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { StepParams } from "../../interfaces";
import { emptyState } from "../../../resources/reducer";
import {
  fakeFarmwareData,
} from "../../../__test_support__/fake_sequence_step_data";
import { Content } from "../../../constants";

describe("<TileTakePhoto/>", () => {
  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "take_photo", args: {} },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    farmwareData: fakeFarmwareData(),
  });

  it("renders step", () => {
    const wrapper = mount(<TileTakePhoto {...fakeProps()} />);
    expect(wrapper.text().toLowerCase())
      .toEqual("photos are viewable from the photos panel.");
  });

  it("renders inputs", () => {
    const wrapper = mount(<TileTakePhoto {...fakeProps()} />);
    const inputs = wrapper.find("input");
    expect(inputs.length).toEqual(1);
    expect(inputs.first().props().placeholder).toEqual("Take a Photo");
    expect(wrapper.html()).toContain("/app/designer/photos");
    expect(wrapper.text()).toContain("photos panel");
  });

  it("displays warning when camera is disabled", () => {
    const p = fakeProps();
    p.farmwareData && (p.farmwareData.cameraDisabled = true);
    const wrapper = mount(<TileTakePhoto {...p} />);
    expect(wrapper.html()).toContain(Content.NO_CAMERA_SELECTED);
  });
});
