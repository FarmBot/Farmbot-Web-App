import * as React from "react";
import { mount, shallow } from "enzyme";
import { HardwareSettings } from "../hardware_settings";
import { HardwareSettingsProps } from "../../interfaces";
import { Actions } from "../../../constants";
import { bot } from "../../../__test_support__/fake_state/bot";
import { panelState } from "../../../__test_support__/control_panel_state";
import { fakeFirmwareConfig } from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";

describe("<HardwareSettings />", () => {
  const fakeProps = (): HardwareSettingsProps => {
    return {
      bot,
      controlPanelState: panelState(),
      botToMqttStatus: "up",
      dispatch: jest.fn(),
      sourceFwConfig: (x) => {
        return { value: bot.hardware.mcu_params[x], consistent: true };
      },
      firmwareConfig: undefined,
      shouldDisplay: jest.fn(),
    };
  };

  it("renders", () => {
    const wrapper = mount(<HardwareSettings {...fakeProps()} />);
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
    clickButton(wrapper, buttonIndex, buttonText, {
      button_tag: buttonElement, partial_match: true
    });
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

  it("shows param export menu", () => {
    const p = fakeProps();
    p.firmwareConfig = fakeFirmwareConfig().body;
    p.firmwareConfig.api_migrated = true;
    const wrapper = shallow(<HardwareSettings {...p} />);
    expect(wrapper.html()).toContain("fa-download");
  });

  it("doesn't show param export menu", () => {
    const wrapper = shallow(<HardwareSettings {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("fa-download");
  });
});
