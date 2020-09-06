import React from "react";
import { mount } from "enzyme";
import { SingleSettingRow, SingleSettingRowProps } from "../single_setting_row";
import { DeviceSetting } from "../../../constants";

describe("<SingleSettingRow />", () => {
  const fakeProps = (): SingleSettingRowProps => ({
    label: DeviceSetting.motors,
    tooltip: "text",
    children: <p>child</p>,
    settingType: "button",
  });

  it("renders button", () => {
    const p = fakeProps();
    const wrapper = mount(<SingleSettingRow {...p} />);
    expect(wrapper.text()).toContain("child");
    expect(wrapper.html()).toContain("centered-button-div");
  });

  it("renders input", () => {
    const p = fakeProps();
    p.settingType = "input";
    const wrapper = mount(<SingleSettingRow {...p} />);
    expect(wrapper.text()).toContain("child");
    expect(wrapper.html()).not.toContain("centered-button-div");
  });
});
