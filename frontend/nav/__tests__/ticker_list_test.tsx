const mockStorj: Dictionary<number | boolean> = {};

let mockDemo = false;
jest.mock("../../devices/must_be_online", () => ({
  forceOnline: () => mockDemo,
}));

import React from "react";
import { mount } from "enzyme";
import { TickerList } from "../ticker_list";
import { Dictionary } from "farmbot";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { TickerListProps } from "../interfaces";
import { MESSAGE_TYPES } from "../../sequences/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Actions } from "../../constants";

describe("<TickerList />", () => {
  beforeEach(() => { mockDemo = false; });

  const fakeTaggedLog = () => {
    const log = fakeLog();
    log.body.message = "Farmbot is up and Running!";
    log.body.created_at = 1501703421;
    return log;
  };

  const fakeProps = (): TickerListProps => ({
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
    logs: [fakeTaggedLog(), fakeTaggedLog()],
    toggle: jest.fn(),
    getConfigValue: x => mockStorj[x],
    botOnline: true,
    lastSeen: 0,
  });

  function expectLogOccurrences(text: string, expectedCount: number) {
    const count = (text.match(/Running/g) || []).length;
    expect(count).toEqual(expectedCount);
  }

  it("shows log message and datetime", () => {
    const wrapper = mount(<TickerList {...fakeProps()} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("AUG 2, 7:50PM");
    expectLogOccurrences(wrapper.text(), 1);
  });

  it("opens logs popup", () => {
    const p = fakeProps();
    const wrapper = mount(<TickerList {...p} />);
    wrapper.find(".ticker-list").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.TOGGLE_POPUP, payload: "jobs" });
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.SET_JOBS_PANEL_OPTION, payload: "logs" });
  });

  it("shows bot offline log message", () => {
    const p = fakeProps();
    p.botOnline = false;
    p.lastSeen = 1501703421000;
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("FarmBot is offline");
    expect(labels.at(1).text()).toEqual("Last seen AUG 2, 7:50PM");
  });

  it("shows demo account log message", () => {
    mockDemo = true;
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Using a demo account");
    expect(labels.at(1).text()).toEqual("");
  });

  it("shows empty log message", () => {
    const p = fakeProps();
    p.logs = [];
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("No logs yet.");
    expect(labels.at(1).text()).toEqual("");
  });

  it("shows 'loading' log message", () => {
    const p = fakeProps();
    p.logs[0].body.message = "";
    p.logs[0].body.created_at = undefined;
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Loading");
    expect(labels.at(1).text()).toEqual("");
  });

  it("all logs filtered out", () => {
    MESSAGE_TYPES.map(logType => mockStorj[logType + "_log"] = 0);
    const p = fakeProps();
    p.logs[0].body.verbosity = 1;
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text())
      .toContain("No logs to display. Visit Logs page to view filters.");
    expect(labels.at(1).text()).toEqual("");
  });
});
