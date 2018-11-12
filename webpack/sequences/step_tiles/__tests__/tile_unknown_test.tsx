import * as React from "react";
import { mount } from "enzyme";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { StepParams } from "../../interfaces";
import { emptyState } from "../../../resources/reducer";
import { TileUnknown } from "../tile_unknown";
import { SequenceBodyItem } from "farmbot";
import { ToolTips } from "../../../constants";

describe("<TileUnknown/>", () => {
  const currentStep = {
    kind: "unknown_step",
    args: { "weird_arg": "hello" }
  };

  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: currentStep as SequenceBodyItem,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
    confirmStepDeletion: false,
  });

  it("renders step", () => {
    const wrapper = mount(<TileUnknown {...fakeProps()} />);
    [ToolTips.UNKNOWN_STEP, "unknown_step", "weird_arg", "hello"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });
});
