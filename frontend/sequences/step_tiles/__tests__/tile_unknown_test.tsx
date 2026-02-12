import React from "react";
import { render } from "@testing-library/react";
import { StepParams } from "../../interfaces";
import { TileUnknown } from "../tile_unknown";
import { SequenceBodyItem } from "farmbot";
import { ToolTips } from "../../../constants";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";

describe("<TileUnknown/>", () => {
  const currentStep = {
    kind: "unknown_step",
    args: { "weird_arg": "hello" }
  };

  const fakeProps = (): StepParams => ({
    ...fakeStepParams(currentStep as SequenceBodyItem),
  });

  it("renders step", () => {
    const { container } = render(<TileUnknown {...fakeProps()} />);
    [ToolTips.UNKNOWN_STEP, "unknown_step", "weird_arg", "hello"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string.toLowerCase()));
  });
});
