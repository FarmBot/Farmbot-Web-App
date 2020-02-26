import * as React from "react";
import { mount } from "enzyme";
import { LogsFilterMenu } from "../filter_menu";
import { LogsFilterMenuProps, LogsState } from "../../interfaces";
import { clickButton } from "../../../__test_support__/helpers";
import { MESSAGE_TYPES, MessageType } from "../../../sequences/interfaces";

const logTypes = MESSAGE_TYPES;

describe("<LogsFilterMenu />", () => {
  const fakeState: LogsState = {
    autoscroll: true, markdown: false, searchTerm: "",
    success: 1, busy: 1, warn: 1,
    error: 1, info: 1, fun: 1, debug: 1, assertion: 1,
  };

  const fakeProps = (): LogsFilterMenuProps => ({
    toggle: jest.fn(),
    setFilterLevel: jest.fn(),
    state: fakeState,
    shouldDisplay: () => false,
  });

  it("renders", () => {
    const wrapper = mount(<LogsFilterMenu {...fakeProps()} />);
    logTypes.filter(x => x !== "assertion").map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    ["autoscroll", "markdown", "searchTerm"].map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string));
  });

  it("renders new types", () => {
    const p = fakeProps();
    p.shouldDisplay = () => true;
    const wrapper = mount(<LogsFilterMenu {...p} />);
    logTypes.map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    ["autoscroll", "markdown", "searchTerm"].map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string));
  });

  it("filters logs", () => {
    const toggle = jest.fn();
    const setFilterLevel = jest.fn();
    const p = fakeProps();
    p.toggle = (x) => () => toggle(x);
    p.setFilterLevel = (x) => () => setFilterLevel(x);
    const wrapper = mount(<LogsFilterMenu {...p} />);
    wrapper.find("button").at(2).simulate("click");
    expect(toggle).toHaveBeenCalledWith(MessageType.success);
  });

  it("shows filter status", () => {
    fakeState.debug = 3;
    fakeState.success = 0;
    const wrapper = mount(<LogsFilterMenu {...fakeProps()} />);
    const toggles = wrapper.find("button");
    expect(toggles.last().hasClass("green")).toBeTruthy();
    expect(toggles.at(2).hasClass("red")).toBeTruthy();
  });

  it("bulk toggles filter levels", () => {
    const setFilterLevel = jest.fn();
    const p = fakeProps();
    p.setFilterLevel = (x) => () => setFilterLevel(x);
    const wrapper = mount(<LogsFilterMenu {...p} />);
    clickButton(wrapper, 0, "max");
    logTypes.map(logType =>
      expect(setFilterLevel).toHaveBeenCalledWith(logType));
    jest.clearAllMocks();
    clickButton(wrapper, 1, "normal");
    logTypes.map(logType =>
      expect(setFilterLevel).toHaveBeenCalledWith(logType));
  });
});
