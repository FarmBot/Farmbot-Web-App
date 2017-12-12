import * as React from "react";
import { mount } from "enzyme";
import { LogsFilterMenu } from "../filter_menu";

const logTypes = ["success", "busy", "warn", "error", "info", "fun", "debug"];

describe("<LogsFilterMenu />", () => {
  const fakeState = {
    autoscroll: true, success: 1, busy: 1, warn: 1,
    error: 1, info: 1, fun: 1, debug: 1
  };
  it("renders", () => {
    const wrapper = mount(
      <LogsFilterMenu
        toggle={jest.fn()} setFilterLevel={jest.fn()} state={fakeState} />);
    logTypes.map(string =>
      expect(wrapper.text().toLowerCase())
        .toContain(string.toLowerCase()));
    expect(wrapper.text()).not.toContain("autscroll");
  });

  it("filters logs", () => {
    const toggle = jest.fn();
    const setFilterLevel = jest.fn();
    const wrapper = mount(
      <LogsFilterMenu
        toggle={(x) => () => toggle(x)}
        setFilterLevel={(x) => () => setFilterLevel(x)}
        state={fakeState} />);
    wrapper.find("button").at(2).simulate("click");
    expect(toggle).toHaveBeenCalledWith("success");
  });

  it("shows filter status", () => {
    fakeState.debug = 3;
    fakeState.success = 0;
    const wrapper = mount(
      <LogsFilterMenu
        toggle={jest.fn()} setFilterLevel={jest.fn()} state={fakeState} />);
    const toggles = wrapper.find("button");
    expect(toggles.last().hasClass("green")).toBeTruthy();
    expect(toggles.at(2).hasClass("red")).toBeTruthy();
  });

  it("bulk toggles filter levels", () => {
    const setFilterLevel = jest.fn();
    const wrapper = mount(
      <LogsFilterMenu
        toggle={jest.fn()}
        setFilterLevel={(x) => () => setFilterLevel(x)}
        state={fakeState} />);
    const max = wrapper.find("button").first();
    expect(max.text()).toEqual("max");
    max.simulate("click");
    logTypes.map(logType =>
      expect(setFilterLevel).toHaveBeenCalledWith(logType));
    jest.clearAllMocks();
    const normal = wrapper.find("button").at(1);
    expect(normal.text()).toEqual("normal");
    normal.simulate("click");
    logTypes.map(logType =>
      expect(setFilterLevel).toHaveBeenCalledWith(logType));
  });
});
