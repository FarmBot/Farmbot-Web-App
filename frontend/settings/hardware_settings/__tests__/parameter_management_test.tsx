jest.mock("../export_menu", () => ({
  importParameters: jest.fn(),
  resendParameters: jest.fn(),
  FwParamExportMenu: () => <div />,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  ParameterManagement, ParameterImport, ParameterImportProps,
} from "../parameter_management";
import { ParameterManagementProps } from "../interfaces";
import { panelState } from "../../../__test_support__/control_panel_state";
import { Content } from "../../../constants";
import { importParameters, resendParameters } from "../export_menu";

describe("<ParameterManagement />", () => {
  const fakeProps = (): ParameterManagementProps => ({
    onReset: jest.fn(),
    firmwareConfig: undefined,
    botOnline: true,
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    arduinoBusy: false,
    getConfigValue: jest.fn(),
  });

  it("renders", () => {
    const p = fakeProps();
    p.controlPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("reset");
  });

  it("resends", () => {
    const p = fakeProps();
    p.controlPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    wrapper.find("button.yellow").first().simulate("click");
    expect(resendParameters).toHaveBeenCalled();
  });

  it("imports", () => {
    window.confirm = jest.fn(() => true);
    const p = fakeProps();
    p.controlPanelState.parameter_management = true;
    const wrapper = mount(<ParameterManagement {...p} />);
    wrapper.find("input").simulate("submit", { currentTarget: { value: "" } });
    wrapper.find("button.yellow").last().simulate("click");
    expect(confirm).toHaveBeenCalledWith(Content.PARAMETER_IMPORT_CONFIRM);
    expect(importParameters).toHaveBeenCalledWith("");
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
