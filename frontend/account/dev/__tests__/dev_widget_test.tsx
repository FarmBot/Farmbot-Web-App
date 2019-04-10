const mockDevSettings: { [key: string]: string } = {};
jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(() => () => { }),
  getWebAppConfigValue: jest.fn(() => () => JSON.stringify(mockDevSettings)),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { DevWidget, DevWidgetFERow, DevWidgetFBOSRow } from "../dev_widget";
import { DevSettings } from "../dev_support";
import { setWebAppConfigValue } from "../../../config_storage/actions";

describe("<DevWidget />", () => {
  const fakeProps = () => ({ dispatch: jest.fn() });

  it("renders", () => {
    const wrapper = mount(<DevWidget {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("show_dev_menu", false);
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });

  it("changes override value", () => {
    const wrapper = shallow(<DevWidgetFBOSRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "1.2.3" } });
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1.2.3" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });

  it("increases override value", () => {
    const wrapper = mount(<DevWidgetFBOSRow />);
    wrapper.find(".fa-angle-double-up").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1000.0.0" }));
    wrapper.find(".fa-times").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });

  it("enables unstable FE features", () => {
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FUTURE_FE_FEATURES]: "true" }));
  });

  it("disables unstable FE features", () => {
    mockDevSettings[DevSettings.FUTURE_FE_FEATURES] = "true";
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("internal_use", "{}");
  });
});
