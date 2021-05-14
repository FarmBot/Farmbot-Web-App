jest.mock("../export_menu", () => ({ resendParameters: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import {
  SettingStatusIndicator,
  SettingStatusIndicatorProps,
} from "../setting_status_indicator";
import { resendParameters } from "../export_menu";

describe("<SettingStatusIndicator />", () => {
  const fakeProps = (): SettingStatusIndicatorProps => ({
    dispatch: jest.fn(),
    wasSyncing: false,
    isSyncing: undefined,
  });

  it("re-sends parameters", () => {
    const p = fakeProps();
    p.wasSyncing = false;
    p.isSyncing = true;
    const wrapper = mount(<SettingStatusIndicator {...p} />);
    wrapper.find(".fa-exclamation-triangle").simulate("click");
    expect(resendParameters).toHaveBeenCalled();
  });

  it("displays spinner", () => {
    const p = fakeProps();
    p.wasSyncing = true;
    p.isSyncing = true;
    const wrapper = mount(<SettingStatusIndicator {...p} />);
    expect(wrapper.find(".fa-spinner").length).toEqual(1);
  });

  it("displays check", () => {
    const p = fakeProps();
    p.wasSyncing = true;
    p.isSyncing = false;
    const wrapper = mount(<SettingStatusIndicator {...p} />);
    expect(wrapper.find(".fa-check").length).toEqual(1);
  });
});
