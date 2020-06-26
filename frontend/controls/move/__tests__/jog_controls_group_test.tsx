import * as React from "react";
import { mount } from "enzyme";
import { JogControlsGroup, JogControlsGroupProps } from "../jog_controls_group";
import { clickButton } from "../../../__test_support__/helpers";
import { Actions } from "../../../constants";

describe("<JogControlsGroup />", () => {
  const fakeProps = (): JogControlsGroupProps => ({
    dispatch: jest.fn(),
    stepSize: 100,
    botPosition: { x: undefined, y: undefined, z: undefined },
    getValue: jest.fn(),
    arduinoBusy: false,
    firmwareSettings: {},
    env: {},
  });

  it("changes step size", () => {
    const p = fakeProps();
    const wrapper = mount(<JogControlsGroup {...p} />);
    clickButton(wrapper, 0, "1");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHANGE_STEP_SIZE,
      payload: 1
    });
  });
});
