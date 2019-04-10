jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

const mockStorj: Dictionary<number | boolean> = {};

import * as React from "react";
import { mount } from "enzyme";
import { Logs } from "../index";
import { ToolTips } from "../../constants";
import { TaggedLog, Dictionary } from "farmbot";
import { NumericSetting } from "../../session_keys";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { LogsProps } from "../interfaces";
import { MessageType } from "../../sequences/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<Logs />", () => {
  function fakeLogs(): TaggedLog[] {
    const log1 = fakeLog();
    log1.body.message = "Fake log message 1";
    const log2 = fakeLog();
    log2.body.message = "Fake log message 2";
    log2.body.type = MessageType.success;
    return [log1, log2];
  }

  const fakeProps = (): LogsProps => {
    return {
      logs: fakeLogs(),
      timeSettings: fakeTimeSettings(),
      dispatch: jest.fn(),
      sourceFbosConfig: jest.fn(),
      getConfigValue: x => mockStorj[x],
      alerts: [],
      apiFirmwareValue: undefined,
    };
  };

  it("renders", () => {
    const wrapper = mount(<Logs {...fakeProps()} />);
    ["Logs", ToolTips.LOGS, "Type", "Message", "Time", "Info",
      "Fake log message 1", "Success", "Fake log message 2"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filters active");
    expect(filterBtn.hasClass("green")).toBeTruthy();
  });

  it("shows message when logs are loading", () => {
    const p = fakeProps();
    p.logs[0].body.message = "";
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("loading");
  });

  it("filters logs", () => {
    const wrapper = mount(<Logs {...fakeProps()} />);
    wrapper.setState({ info: 0 });
    expect(wrapper.text()).not.toContain("Fake log message 1");
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filters active");
    expect(filterBtn.hasClass("green")).toBeTruthy();
  });

  it("doesn't show logs of any verbosity when type is disabled", () => {
    const p = fakeProps();
    p.logs[0].body.verbosity = 0;
    const notShownMessage = "This log should not be shown.";
    p.logs[0].body.message = notShownMessage;
    p.logs[0].body.type = MessageType.info;
    const wrapper = mount(<Logs {...p} />);
    wrapper.setState({ info: 0 });
    expect(wrapper.text()).not.toContain(notShownMessage);
  });

  it("shows position", () => {
    const p = fakeProps();
    p.logs[0].body.x = 100;
    p.logs[0].body.y = undefined;
    p.logs[0].body.z = undefined;
    p.logs[1].body.x = 0;
    p.logs[1].body.y = 1;
    p.logs[1].body.z = 2;
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.text()).toContain("Unknown");
    expect(wrapper.text()).toContain("0, 1, 2");
  });

  it("shows verbosity", () => {
    const p = fakeProps();
    p.logs[0].body.verbosity = -999;
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.text()).toContain(-999);
  });

  it("loads filter setting", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.instance().state.warn).toEqual(3);
  });

  it("shows overall filter status", () => {
    const wrapper = mount(<Logs {...fakeProps()} />);
    wrapper.setState({
      success: 3, busy: 3, warn: 3, error: 3, info: 3, fun: 3, debug: 3
    });
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filter");
    expect(filterBtn.hasClass("gray")).toBeTruthy();
  });

  it("toggles filter", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.instance().state.warn).toEqual(3);
    wrapper.instance().toggle(MessageType.warn)();
    expect(wrapper.instance().state.warn).toEqual(0);
    wrapper.instance().toggle(MessageType.warn)();
    expect(wrapper.instance().state.warn).toEqual(1);
  });

  it("sets filter", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.instance().state.warn).toEqual(3);
    wrapper.instance().setFilterLevel(MessageType.warn)(2);
    expect(wrapper.instance().state.warn).toEqual(2);
  });
});
