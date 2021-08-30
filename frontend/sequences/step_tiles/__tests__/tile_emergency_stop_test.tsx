import React from "react";
import { mount } from "enzyme";
import { TileEmergencyStop } from "../tile_emergency_stop";
import { StepParams } from "../../interfaces";
import { Content } from "../../../constants";
import { fakeStepParams } from "../../../__test_support__/fake_sequence_step_data";
import { EmergencyLock } from "farmbot";

describe("<TileEmergencyStop />", () => {
  const fakeProps = (): StepParams<EmergencyLock> => ({
    ...fakeStepParams({ kind: "emergency_lock", args: {} }),
  });

  it("renders step", () => {
    const step = mount(<TileEmergencyStop {...fakeProps()} />);
    expect(step.text()).toEqual(Content.ESTOP_STEP);
  });
});
