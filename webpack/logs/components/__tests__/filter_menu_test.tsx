import * as React from "react";
import { mount } from "enzyme";
import { LogsFilterMenu } from "../filter_menu";

describe("<LogsFilterMenu />", () => {
  const fakeState = {
    autoscroll: true, success: true, busy: true, warn: true,
    error: true, info: true, fun: true, debug: true
  };
  it("renders", () => {
    const wrapper = mount(
      <LogsFilterMenu toggle={jest.fn()} state={fakeState} />);
    ["success", "busy", "warn", "error", "info", "fun", "debug"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    expect(wrapper.text()).not.toContain("autscroll");
  });

  it("filters logs", () => {
    const toggle = jest.fn();
    const wrapper = mount(
      <LogsFilterMenu toggle={(x) => () => toggle(x)} state={fakeState} />);
    wrapper.find("button").first().simulate("click");
    expect(toggle).toHaveBeenCalledWith("success");
  });
});
