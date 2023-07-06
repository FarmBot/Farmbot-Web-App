import React from "react";
import { mount, shallow } from "enzyme";
import { LogsFilterMenu, NON_FILTER_SETTINGS } from "../filter_menu";
import { LogsFilterMenuProps, LogsState } from "../../interfaces";
import { MESSAGE_TYPES } from "../../../sequences/interfaces";
import { Slider } from "@blueprintjs/core";

const logTypes = MESSAGE_TYPES;

describe("<LogsFilterMenu />", () => {
  const fakeState: LogsState = {
    autoscroll: true, markdown: false, searchTerm: "", currentFbosOnly: false,
    success: 1, busy: 1, warn: 1,
    error: 1, info: 1, fun: 1, debug: 1, assertion: 1,
  };

  const fakeProps = (): LogsFilterMenuProps => ({
    toggle: jest.fn(),
    setFilterLevel: jest.fn(),
    state: fakeState,
    toggleCurrentFbosOnly: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<LogsFilterMenu {...fakeProps()} />);
    logTypes.filter(x => x !== "assertion").map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    NON_FILTER_SETTINGS.map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string));
  });

  it("renders new types", () => {
    const p = fakeProps();
    const wrapper = mount(<LogsFilterMenu {...p} />);
    logTypes.map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    NON_FILTER_SETTINGS.map(string =>
      expect(wrapper.text().toLowerCase()).not.toContain(string));
  });

  it("renders setting on", () => {
    const p = fakeProps();
    p.state.currentFbosOnly = true;
    const wrapper = mount(<LogsFilterMenu {...p} />);
    expect(wrapper.find(".fb-toggle-button").first().hasClass("green"))
      .toBeTruthy();
  });

  it("bulk toggles filter levels", () => {
    const setFilterLevel = jest.fn();
    const p = fakeProps();
    p.setFilterLevel = (x) => (v) => setFilterLevel(x, v);
    const wrapper = shallow(<LogsFilterMenu {...p} />);
    wrapper.find(Slider).first().simulate("change", 2);
    wrapper.find(Slider).first().simulate("release", 2);
    logTypes.map(logType =>
      expect(setFilterLevel).toHaveBeenCalledWith(logType, 2));
  });
});
