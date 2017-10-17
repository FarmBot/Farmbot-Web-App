import * as React from "react";
import { mount } from "enzyme";
import { HardwareSettings } from "../hardware_settings";
import { fakeState } from "../../../__test_support__/fake_state";
import { ControlPanelState } from "../../interfaces";
import { Actions } from "../../../constants";

describe("<HardwareSettings />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function panelState(): ControlPanelState {
    return {
      homing_and_calibration: false,
      motors: false,
      encoders_and_endstops: false,
      danger_zone: false
    };
  }

  it("renders", () => {
    const wrapper = mount(<HardwareSettings
      controlPanelState={panelState()}
      dispatch={jest.fn()}
      bot={fakeState().bot} />);
    ["expand all", "x axis", "motors"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  function checkDispatch(
    buttonElement: string,
    buttonIndex: number,
    buttonText: string,
    type: string,
    payload: boolean | string) {
    const dispatch = jest.fn();
    const wrapper = mount(<HardwareSettings
      controlPanelState={panelState()}
      dispatch={dispatch}
      bot={fakeState().bot} />);
    const button = wrapper.find(buttonElement).at(buttonIndex);
    expect(button.text().toLowerCase()).toContain(buttonText);
    button.simulate("click");
    expect(dispatch).toHaveBeenCalledWith({ payload, type });
  }

  it("expands all", () => {
    checkDispatch("button", 1, "expand all",
      Actions.BULK_TOGGLE_CONTROL_PANEL, true);
  });

  it("collapses all", () => {
    checkDispatch("button", 2, "collapse all",
      Actions.BULK_TOGGLE_CONTROL_PANEL, false);
  });

  it("toggles motor category", () => {
    checkDispatch("h4", 1, "motors",
      Actions.TOGGLE_CONTROL_PANEL_OPTION, "motors");
  });
});
