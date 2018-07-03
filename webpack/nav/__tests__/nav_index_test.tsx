import * as React from "react";
import { shallow } from "enzyme";

import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { taggedUser } from "../../__test_support__/user";

describe("NavBar", () => {

  it("has correct parent classname", () => {
    const wrapper = shallow(
      <NavBar
        timeOffset={0}
        consistent={true}
        logs={[]}
        bot={bot}
        user={taggedUser}
        dispatch={jest.fn()} />
    );
    expect(wrapper.find("div").first().hasClass("nav-wrapper")).toBeTruthy();
  });

  it("closes nav menu", () => {
    const wrapper = shallow<NavBar>(<NavBar
      timeOffset={0}
      consistent={true}
      logs={[]}
      bot={bot}
      user={taggedUser}
      dispatch={jest.fn()} />);
    const link = wrapper.find("Link").first();
    link.simulate("click");
    expect(wrapper.instance().state.mobileMenuOpen).toBeFalsy();
    link.simulate("click");
    expect(wrapper.instance().state.mobileMenuOpen).toBeFalsy();
  });
});
