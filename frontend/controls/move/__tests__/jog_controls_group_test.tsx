import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { JogControlsGroup } from "../jog_controls_group";
import { JogControlsGroupProps } from "../interfaces";
import { Actions } from "../../../constants";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";

describe("<JogControlsGroup />", () => {
  const fakeProps = (): JogControlsGroupProps => ({
    dispatch: jest.fn(),
    stepSize: 100,
    botPosition: { x: undefined, y: undefined, z: undefined },
    getConfigValue: jest.fn(),
    arduinoBusy: false,
    botOnline: true,
    firmwareSettings: {},
    env: {},
    locked: false,
    movementState: fakeMovementState(),
    imageJobs: [],
    logs: [],
  });

  it("changes step size", () => {
    const p = fakeProps();
    render(<JogControlsGroup {...p} />);
    fireEvent.click(screen.getByText("1"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHANGE_STEP_SIZE,
      payload: 1
    });
  });
});
