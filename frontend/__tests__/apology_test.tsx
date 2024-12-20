jest.mock("../session", () => ({ Session: { clear: jest.fn() } }));

import React from "react";
import { mount } from "enzyme";
import { Apology } from "../apology";
import { Session } from "../session";

describe("<Apology />", () => {
  it("clears session", () => {
    const wrapper = mount(<Apology />);
    wrapper.find("a").first().simulate("click");
    expect(Session.clear).toHaveBeenCalled();
  });
});
