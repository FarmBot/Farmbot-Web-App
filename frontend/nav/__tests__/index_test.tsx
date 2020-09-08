jest.mock("../../devices/timezones/guess_timezone", () => ({
  maybeSetTimezone: jest.fn()
}));

jest.mock("../../session", () => ({ Session: { clear: jest.fn() } }));

jest.mock("../../api/crud", () => ({ refresh: jest.fn() }));

import React from "react";
import { shallow, mount } from "enzyme";
import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { taggedUser } from "../../__test_support__/user";
import { NavBarProps } from "../interfaces";
import { fakeDevice } from "../../__test_support__/resource_index_builder";
import { maybeSetTimezone } from "../../devices/timezones/guess_timezone";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { fakePings } from "../../__test_support__/fake_state/pings";
import { Link } from "../../link";
import { Session } from "../../session";
import { refresh } from "../../api/crud";

describe("<NavBar />", () => {
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
    pings: fakePings(),
    alerts: [],
    apiFirmwareValue: undefined,
    authAud: undefined,
  });

  it("has correct parent className", () => {
    const wrapper = shallow(<NavBar {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("nav-wrapper")).toBeTruthy();
    expect(wrapper.find("div").first().hasClass("red")).toBeFalsy();
  });

  it("closes nav menu", () => {
    const wrapper = mount<NavBar>(<NavBar {...fakeProps()} />);
    const link = wrapper.find(Link).first();
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

  it("handles missing user", () => {
    const p = fakeProps();
    p.user = undefined;
    const wrapper = mount(<NavBar {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("menu");
  });

  it("logs out", () => {
    const wrapper = mount<NavBar>(<NavBar {...fakeProps()} />);
    wrapper.instance().logout();
    expect(Session.clear).toHaveBeenCalled();
  });

  it("toggles state value", () => {
    const wrapper = shallow<NavBar>(<NavBar {...fakeProps()} />);
    expect(wrapper.state().mobileMenuOpen).toEqual(false);
    wrapper.instance().toggle("mobileMenuOpen")();
    expect(wrapper.state().mobileMenuOpen).toEqual(true);
  });

  it("refreshes device", () => {
    const p = fakeProps();
    const wrapper = mount<NavBar>(<NavBar {...p} />);
    expect(wrapper.state().documentTitle).toEqual("");
    document.title = "new page";
    wrapper.instance().componentDidUpdate();
    expect(wrapper.state().documentTitle).not.toEqual("");
    expect(refresh).toHaveBeenCalledWith(p.device);
    jest.resetAllMocks();
    wrapper.instance().componentDidUpdate();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("displays connectivity saucer", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 400,
      configurable: true
    });
    const wrapper = mount(<NavBar {...fakeProps()} />);
    expect(wrapper.find(".saucer").length).toEqual(2);
    expect(wrapper.text().toLowerCase()).not.toContain("connectivity");
  });

  it("displays connectivity saucer and button", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 500,
      configurable: true
    });
    const wrapper = mount(<NavBar {...fakeProps()} />);
    expect(wrapper.find(".saucer").length).toEqual(2);
    expect(wrapper.text().toLowerCase()).toContain("connectivity");
  });

  it("displays navbar visual warning for support tokens", () => {
    const p = fakeProps();
    p.authAud = "staff";
    const wrapper = shallow(<NavBar {...p} />);
    expect(wrapper.find("div").first().hasClass("red")).toBeTruthy();
  });
});
