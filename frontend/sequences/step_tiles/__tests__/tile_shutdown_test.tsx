import React from "react";
import { mount } from "enzyme";
import { TileShutdown } from "../tile_shutdown";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";
import { Content } from "../../../constants";

describe("<TileShutdown />", () => {
  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "power_off", args: {} },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
  });

  it("renders step", () => {
    const block = mount(<TileShutdown {...fakeProps()} />);
    expect(block.text()).toContain(Content.SHUTDOWN_STEP);
  });
});
