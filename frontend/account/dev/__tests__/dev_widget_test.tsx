jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn()
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
    localStorage[DevSettings.FUTURE_FE_FEATURES] = "true";
    localStorage[DevSettings.FBOS_VERSION_OVERRIDE] = "1.0.0";
    wrapper.find("button").first().simulate("click");
    expect(setWebAppConfigValue).toHaveBeenCalledWith("show_dev_menu", false);
    expect(localStorage[DevSettings.FUTURE_FE_FEATURES]).toEqual(undefined);
    expect(localStorage[DevSettings.FBOS_VERSION_OVERRIDE]).toEqual(undefined);
  });

  it("changes override value", () => {
    const wrapper = shallow(<DevWidgetFBOSRow />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "1.2.3" } });
    expect(localStorage[DevSettings.FBOS_VERSION_OVERRIDE]).toEqual("1.2.3");
    wrapper.find(".fa-times").simulate("click");
    expect(localStorage[DevSettings.FBOS_VERSION_OVERRIDE]).toEqual(undefined);
  });

  it("increases override value", () => {
    const wrapper = mount(<DevWidgetFBOSRow />);
    wrapper.find(".fa-angle-double-up").simulate("click");
    expect(localStorage[DevSettings.FBOS_VERSION_OVERRIDE])
      .toEqual("1000.0.0");
    wrapper.find(".fa-times").simulate("click");
    expect(localStorage[DevSettings.FBOS_VERSION_OVERRIDE]).toEqual(undefined);
  });

  it("toggles unstable FE features", () => {
    localStorage[DevSettings.FUTURE_FE_FEATURES] = "true";
    const wrapper = mount(<DevWidgetFERow />);
    wrapper.find("button").simulate("click");
    expect(localStorage[DevSettings.FUTURE_FE_FEATURES]).toEqual(undefined);
  });
});
