import React from "react";
import { mount } from "enzyme";
import { Apology } from "../apology";
import { Session } from "../session";

describe("<Apology />", () => {
  let clearSpy: jest.SpyInstance;

  beforeEach(() => {
    clearSpy = jest.spyOn(Session, "clear").mockImplementation(jest.fn());
  });

  afterEach(() => {
    clearSpy.mockRestore();
  });

  it("clears session", () => {
    const wrapper = mount(<Apology />);
    wrapper.find("a").first().simulate("click");
    expect(Session.clear).toHaveBeenCalled();
  });
});
