jest.mock("../../../api/crud", () => ({ overwrite: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { StepRadio, StepRadioProps } from "../step_radio";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { FindHome } from "farmbot";
import { overwrite } from "../../../api/crud";

describe("<StepRadio />", () => {
  const currentStep: FindHome = {
    kind: "find_home",
    args: {
      speed: 100,
      axis: "x"
    }
  };

  const fakeProps = (): StepRadioProps => ({
    currentSequence: fakeSequence(),
    currentStep,
    dispatch: jest.fn(),
    index: 0,
    label: "Find",
  });

  it("renders", () => {
    const wrapper = mount(<StepRadio {...fakeProps()} />);
    expect(wrapper.find("input").length).toEqual(4);
    expect(wrapper.text()).toContain("Find");
  });

  it("handles update", () => {
    const p = fakeProps();
    const wrapper = mount(<StepRadio {...p} />);
    wrapper.find("input").last().simulate("change");
    const expectedStep: FindHome = {
      kind: "find_home",
      args: { speed: 100, axis: "all" }
    };
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence,
      expect.objectContaining({ body: [expectedStep] }));
  });
});
