import * as React from "react";
import { mount } from "enzyme";

import { NavBar } from "../index";
import { bot } from "../../__test_support__/fake_state/bot";
import { log } from "../../__test_support__/log";
import { taggedUser } from "../../__test_support__/user";

describe("NavBar", () => {

  it("has correct parent classname", () => {
    let wrapper = mount(
      <NavBar
        logs={[log]}
        bot={bot}
        user={taggedUser}
        dispatch={jest.fn()}
      />
    );

    expect(wrapper.hasClass("nav-wrapper")).toBeTruthy();
  });
});
