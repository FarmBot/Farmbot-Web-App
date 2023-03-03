jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../../../devices/actions", () => ({
  updateConfig: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  OtaTimeSelector, OtaTimeSelectorRow, DDI_ASAP,
} from "../ota_time_selector";
import { FBSelect } from "../../../ui";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { OtaTimeSelectorProps, OtaTimeSelectorRowProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { edit } from "../../../api/crud";
import { updateConfig } from "../../../devices/actions";

describe("<OtaTimeSelector />", () => {
  const fakeProps = (): OtaTimeSelectorProps => ({
    timeSettings: fakeTimeSettings(),
    device: fakeDevice(),
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: true, consistent: true }),
  });

  it("renders the default value", () => {
    const p = fakeProps();
    p.device.body.ota_hour = undefined;
    const wrapper = mount(<OtaTimeSelector {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem).toEqual(undefined);
    expect(wrapper.text()).toContain(DDI_ASAP().label);
  });

  it("renders the current value", () => {
    const p = fakeProps();
    p.device.body.ota_hour = 17;
    const wrapper = mount(<OtaTimeSelector {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem)
      .toEqual({ label: "5:00 PM", value: 17 });
    expect(wrapper.text()).not.toContain(DDI_ASAP().label);
  });

  it("renders the current value using UTC data", () => {
    const p = fakeProps();
    p.device.body.ota_hour_utc = 17;
    const wrapper = mount(<OtaTimeSelector {...p} />);
    expect(wrapper.find(FBSelect).props().selectedItem)
      .toEqual({ label: "5:00 PM", value: 17 });
    expect(wrapper.text()).not.toContain(DDI_ASAP().label);
  });

  it("selects an OTA update time", () => {
    const p = fakeProps();
    const wrapper = shallow(<OtaTimeSelector {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "at 5 PM", value: 17 });
    expect(edit).toHaveBeenCalledWith(p.device,
      { ota_hour: 17, ota_hour_utc: 17 });
  });

  it("unselects an OTA update time", () => {
    const p = fakeProps();
    const wrapper = shallow(<OtaTimeSelector {...p} />);
    wrapper.find(FBSelect).simulate("change", undefined);
    expect(edit).toHaveBeenCalledWith(p.device,
      { otc_hour: undefined, otc_hour_utc: undefined });
    expect(updateConfig).not.toHaveBeenCalled();
  });

  it("selects never", () => {
    const p = fakeProps();
    const wrapper = shallow(<OtaTimeSelector {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: "never" });
    expect(edit).not.toHaveBeenCalled();
    expect(updateConfig).toHaveBeenCalledWith({ os_auto_update: false });
  });

  it("enables auto update", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: false, consistent: false });
    const wrapper = shallow(<OtaTimeSelector {...p} />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: 17 });
    expect(edit).toHaveBeenCalledWith(p.device,
      { ota_hour: 17, ota_hour_utc: 17 });
    expect(updateConfig).toHaveBeenCalledWith({ os_auto_update: true });
  });
});

describe("<OtaTimeSelectorRow />", () => {
  const fakeProps = (): OtaTimeSelectorRowProps => ({
    dispatch: jest.fn(),
    sourceFbosConfig: () => ({ value: "", consistent: true }),
    device: fakeDevice(),
    timeSettings: fakeTimeSettings(),
    showAdvanced: true,
  });

  it("shows 12h formatted times", () => {
    const p = fakeProps();
    p.timeSettings.hour24 = false;
    const wrapper = mount(<OtaTimeSelectorRow {...p} />);
    expect(wrapper.find(FBSelect).props().list)
      .toContainEqual({ label: "8:00 PM", value: 20 });
  });

  it("shows 24h formatted times", () => {
    const p = fakeProps();
    p.timeSettings.hour24 = true;
    const wrapper = mount(<OtaTimeSelectorRow {...p} />);
    expect(wrapper.find(FBSelect).props().list)
      .toContainEqual({ label: "20:00", value: 20 });
  });
});
