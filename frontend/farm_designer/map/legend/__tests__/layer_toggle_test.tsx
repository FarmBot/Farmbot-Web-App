import React from "react";
import { LayerToggle, LayerToggleProps } from "../layer_toggle";
import { shallow } from "enzyme";
import { DeviceSetting } from "../../../../constants";
import { BooleanSetting } from "../../../../session_keys";

describe("<LayerToggle />", () => {
  const fakeProps = (): LayerToggleProps => ({
    settingName: BooleanSetting.show_farmbot,
    label: DeviceSetting.showFarmbot,
    value: true,
    onClick: jest.fn(),
  });

  it("renders", () => {
    const wrapper = shallow(<LayerToggle {...fakeProps()} />);
    expect(wrapper.text()).toEqual("FarmBot");
    expect(wrapper.html()).toContain("green");
  });

  it("toggles", () => {
    const p = fakeProps();
    const wrapper = shallow(<LayerToggle {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.onClick).toHaveBeenCalled();
  });
});
