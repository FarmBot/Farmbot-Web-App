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

  it("renders", () => {
    const p = fakeProps();
    const wrapper = mount(<SingleSettingRow {...p} />);
    expect(wrapper.text()).toContain("child");
  });
});
