import React from "react";
import { mount } from "enzyme";
import { TileEmergencyStop } from "../tile_emergency_stop";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { emptyState } from "../../../resources/reducer";
import { StepParams } from "../../interfaces";
import { Content } from "../../../constants";

describe("<TileEmergencyStop />", () => {
  const fakeProps = (): StepParams => ({
    currentSequence: fakeSequence(),
    currentStep: { kind: "emergency_lock", args: {} },
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
  });

  it("renders step", () => {
    const step = mount(<TileEmergencyStop {...fakeProps()} />);
    expect(step.text()).toEqual(Content.ESTOP_STEP);
  });
});
