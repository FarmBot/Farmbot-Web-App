jest.mock("../../devices/timezones/guess_timezone", () => ({
  maybeSetTimezone: jest.fn()
}));

import * as React from "react";
import { shallow, mount } from "enzyme";
import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { taggedUser } from "../../__test_support__/user";
import { NavBarProps } from "../interfaces";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { maybeSetTimezone } from "../../devices/timezones/guess_timezone";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("NavBar", () => {
  const fakeProps = (): NavBarProps => ({
    timeSettings: fakeTimeSettings(),
    consistent: true,
    logs: [],
    bot,
    user: taggedUser,
    dispatch: jest.fn(),
    getConfigValue: jest.fn(),
    tour: undefined,
    device: fakeDevice(),
    autoSync: false,
    alertCount: 0,
  });

  it("has correct parent classname", () => {
    const wrapper = shallow(<NavBar {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("nav-wrapper")).toBeTruthy();
  });

  it("closes nav menu", () => {
    const wrapper = shallow<NavBar>(<NavBar {...fakeProps()} />);
    const link = wrapper.find("Link").first();
    link.simulate("click");
    expect(wrapper.instance().state.mobileMenuOpen).toBeFalsy();
    link.simulate("click");
    expect(wrapper.instance().state.mobileMenuOpen).toBeFalsy();
  });

  it("silently sets user timezone as needed", () => {
    const p = fakeProps();
    p.device = fakeDevice({ timezone: undefined });
    const wrapper = mount(<NavBar {...p} />);
    wrapper.mount();
    expect(maybeSetTimezone).toHaveBeenCalledWith(p.dispatch, p.device);
  });
});
