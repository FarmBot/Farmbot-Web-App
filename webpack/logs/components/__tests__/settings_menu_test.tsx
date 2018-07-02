const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));

const mockStorj: Dictionary<number | boolean> = {};

jest.mock("../../../session", () => {
  return {
    Session: {
      deprecatedGetNum: (k: string) => {
        return mockStorj[k];
      },
      setNum: (k: string, v: number) => {
        mockStorj[k] = v;
      },
      deprecatedGetBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    },
    // tslint:disable-next-line:no-any
    safeNumericSetting: (x: any) => x

  };
});

import * as React from "react";
import { mount } from "enzyme";
import { LogsSettingsMenu } from "../settings_menu";
import { bot } from "../../../__test_support__/fake_state/bot";
import { ConfigurationName, Dictionary } from "farmbot";
import { NumericSetting } from "../../../session_keys";
import { LogsSettingsMenuProps } from "../../interfaces";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<LogsSettingsMenu />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fakeProps = (): LogsSettingsMenuProps => {
    return {
      setFilterLevel: () => jest.fn(),
      dispatch: jest.fn(x => x(jest.fn(), fakeState)),
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      }
    };
  };

  it("renders", () => {
    const wrapper = mount<{}>(<LogsSettingsMenu {...fakeProps() } />);
    ["begin", "steps", "complete"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it("toggles setting", () => {
      bot.hardware.configuration[setting] = false;
      const wrapper = mount<{}>(<LogsSettingsMenu {...fakeProps() } />);
      wrapper.find("button").at(position).simulate("click");
      expect(mockDevice.updateConfig)
        .toHaveBeenCalledWith({ [setting]: true });
    });
  }
  testSettingToggle("sequence_init_log", 0);
  testSettingToggle("sequence_body_log", 1);
  testSettingToggle("sequence_complete_log", 2);
  testSettingToggle("firmware_output_log", 3);
  testSettingToggle("firmware_input_log", 4);
  testSettingToggle("arduino_debug_messages", 5);

  it("conditionally increases filter level", () => {
    const p = fakeProps();
    const setFilterLevel = jest.fn();
    p.setFilterLevel = () => setFilterLevel;
    const wrapper = mount<{}>(<LogsSettingsMenu {...p} />);
    mockStorj[NumericSetting.busy_log] = 0;
    wrapper.find("button").at(0).simulate("click");
    expect(setFilterLevel).toHaveBeenCalledWith(2);
    jest.clearAllMocks();
    mockStorj[NumericSetting.busy_log] = 3;
    wrapper.find("button").at(0).simulate("click");
    expect(setFilterLevel).not.toHaveBeenCalled();
  });
});
