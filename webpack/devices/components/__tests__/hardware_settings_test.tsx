import * as React from "react";
import { mount } from "enzyme";
import { HardwareSettings } from "../hardware_settings";
import { HardwareSettingsProps } from "../../interfaces";
import { Actions } from "../../../constants";
import { bot } from "../../../__test_support__/fake_state/bot";
import { panelState } from "../../../__test_support__/control_panel_state";

describe("<HardwareSettings />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fakeProps = (): HardwareSettingsProps => {
    return {
      bot,
      controlPanelState: panelState(),
      botToMqttStatus: "up",
      dispatch: jest.fn(),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
    };
  };

  it("renders", () => {
    const wrapper = mount(<HardwareSettings {...fakeProps() } />);
    ["expand all", "x axis", "motors"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  function checkDispatch(
    buttonElement: string,
    buttonIndex: number,
    buttonText: string,
    type: string,
    payload: boolean | string) {
    const p = fakeProps();
    const wrapper = mount(<HardwareSettings {...p} />);
    const button = wrapper.find(buttonElement).at(buttonIndex);
    expect(button.text().toLowerCase()).toContain(buttonText);
    button.simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({ payload, type });
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
