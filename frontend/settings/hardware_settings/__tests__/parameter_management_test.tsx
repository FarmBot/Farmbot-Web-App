import React from "react";
import { mount, shallow } from "enzyme";
import {
  ParameterManagement, ParameterImport, ParameterImportProps,
} from "../parameter_management";
import { ParameterManagementProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { Content } from "../../../constants";
import * as exportMenu from "../export_menu";
import * as configStorageActions from "../../../config_storage/actions";
import { BooleanSetting } from "../../../session_keys";

beforeEach(() => {
  jest.spyOn(exportMenu, "importParameters")
    .mockImplementation(jest.fn());
  jest.spyOn(exportMenu, "resendParameters")
    .mockImplementation(jest.fn());
  jest.spyOn(exportMenu, "FwParamExportMenu")
    .mockImplementation(() => <div />);
  jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => false);
  jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("<ParameterManagement />", () => {
  const fakeProps = (): ParameterManagementProps => ({
    onReset: jest.fn(),
    firmwareConfig: undefined,
    botOnline: true,
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    getConfigValue: jest.fn(),
    showAdvanced: true,
  });

  it("renders", () => {
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("reset");
  });

  it("resends", () => {
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    wrapper.find("button.yellow").first().simulate("click");
    expect(exportMenu.resendParameters).toHaveBeenCalled();
  });

  it("imports", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    wrapper.find("input").simulate("submit", { currentTarget: { value: "" } });
    wrapper.find("button.yellow").last().simulate("click");
    expect(confirm).toHaveBeenCalledWith(Content.PARAMETER_IMPORT_CONFIRM);
    expect(exportMenu.importParameters).toHaveBeenCalledWith("");
  });

  it("toggles advanced settings", () => {
    const p = fakeProps();
    p.settingsPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    wrapper.find(".fb-toggle-button").at(1).simulate("click");
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_advanced_settings, true);
  });
});

describe("<ParameterImport />", () => {
  const fakeProps = (): ParameterImportProps => ({
    dispatch: jest.fn(),
    arduinoBusy: false,
  });

  it("updates", () => {
    const wrapper = shallow<ParameterImport>(<ParameterImport {...fakeProps()} />);
    expect(wrapper.state().input).toEqual("");
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "{}" }
    });
    expect(wrapper.state().input).toEqual("{}");
  });
});
