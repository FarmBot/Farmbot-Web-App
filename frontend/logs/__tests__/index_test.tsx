const mockStorj: Dictionary<number | boolean> = {};

jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
}));

import React from "react";
import { ReactWrapper, mount, shallow } from "enzyme";
import { LogsPanel as Logs, RawLogs } from "../index";
import { TaggedLog, Dictionary } from "farmbot";
import { NumericSetting } from "../../session_keys";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { LogsPanelProps, LogsProps } from "../interfaces";
import { MessageType } from "../../sequences/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { SearchField } from "../../ui/search_field";
import { bot } from "../../__test_support__/fake_state/bot";
import { destroy } from "../../api/crud";
import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

describe("<Logs />", () => {
  function fakeLogs(): TaggedLog[] {
    const log1 = fakeLog();
    log1.body.message = "Fake log message 1";
    const log2 = fakeLog();
    log2.body.message = "Fake log message 2";
    log2.body.type = MessageType.success;
    return [log1, log2];
  }

  const fakeProps = (): LogsProps => ({
    logs: fakeLogs(),
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
    sourceFbosConfig: jest.fn(),
    getConfigValue: x => mockStorj[x],
    bot: bot,
    fbosVersion: undefined,
    device: fakeDevice(),
  });

  const verifyFilterState = (wrapper: ReactWrapper<unknown>, enabled: boolean) => {
    const filterBtn = wrapper.find(".fa-filter");
    expect(filterBtn.props().style?.color).toEqual(enabled ? "white" : "#434343");
  };

  it("renders", () => {
    const wrapper = mount(<Logs {...fakeProps()} />);
    ["Message", "Time", "Fake log message 1", "Fake log message 2"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    verifyFilterState(wrapper, true);
    expect(wrapper.text().toLowerCase()).not.toContain("demo");
  });

  it("handles unknown log type", () => {
    const p = fakeProps();
    p.logs = fakeLogs();
    p.logs[0].body.type = "unknown" as MessageType;
    const wrapper = mount(<Logs {...p} />);
    ["Message", "Time", "Fake log message 1", "Fake log message 2"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    verifyFilterState(wrapper, true);
    expect(wrapper.text().toLowerCase()).not.toContain("demo");
  });

  it("shows message when logs are loading", () => {
    const p = fakeProps();
    p.logs[0].body.message = "";
    const wrapper = mount(<Logs {...p} />);
    wrapper.setState({ markdown: false });
    expect(wrapper.text().toLowerCase()).toContain("loading");
  });

  it("filters logs", () => {
    const wrapper = mount(<Logs {...fakeProps()} />);
    wrapper.setState({ info: 0 });
    expect(wrapper.text()).not.toContain("Fake log message 1");
    verifyFilterState(wrapper, true);
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

  it("doesn't show negative verbosity", () => {
    const p = fakeProps();
    p.logs[0].body.verbosity = -999;
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.text()).not.toContain("-999");
  });

  it("doesn't show invalid time", () => {
    const p = fakeProps();
    p.logs[0].body.created_at = undefined;
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("unknown");
    expect(wrapper.text().toLowerCase()).not.toContain("invalid");
  });

  it("loads filter setting", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.instance().state.warn).toEqual(3);
  });

  const fakeLogsState = () => ({
    assertion: 3,
    busy: 3,
    debug: 3,
    error: 3,
    fun: 3,
    info: 3,
    success: 3,
    warn: 3,
  });

  it("shows overall filter status", () => {
    const wrapper = mount(<Logs {...fakeProps()} />);
    wrapper.setState(fakeLogsState());
    verifyFilterState(wrapper, false);
  });

  it("shows filtered overall filter status", () => {
    const p = fakeProps();
    const wrapper = mount(<Logs {...p} />);
    const state = fakeLogsState();
    state.assertion = 2;
    wrapper.setState(state);
    verifyFilterState(wrapper, true);
  });

  it("shows unfiltered overall filter status", () => {
    const p = fakeProps();
    const wrapper = mount(<Logs {...p} />);
    const state = fakeLogsState();
    state.assertion = 3;
    wrapper.setState(state);
    verifyFilterState(wrapper, false);
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

  it("toggles setting", () => {
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.state().currentFbosOnly).toEqual(false);
    wrapper.instance().toggleCurrentFbosOnly();
    expect(wrapper.state().currentFbosOnly).toEqual(true);
  });

  it("sets filter", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.instance().state.warn).toEqual(3);
    wrapper.instance().setFilterLevel(MessageType.warn)(2);
    expect(wrapper.instance().state.warn).toEqual(2);
  });

  it("toggles raw text display", () => {
    const wrapper = mount<Logs>(<Logs {...fakeProps()} />);
    expect(wrapper.state().markdown).toBeTruthy();
    wrapper.instance().toggleMarkdown();
    expect(wrapper.state().markdown).toBeFalsy();
  });

  it("renders formatted messages", () => {
    const p = fakeProps();
    p.logs[0].body.message = "`message`";
    const wrapper = mount<Logs>(<Logs {...p} />);
    expect(wrapper.state().markdown).toBeTruthy();
    expect(wrapper.html()).toContain("<code>message</code>");
    wrapper.setState({ markdown: false });
    expect(wrapper.html()).not.toContain("<code>message</code>");
  });

  it("changes search term", () => {
    const p = fakeProps();
    const wrapper = shallow<Logs>(<Logs {...p} />);
    wrapper.find(SearchField).first().simulate("change", "one");
    expect(wrapper.state().searchTerm).toEqual("one");
  });

  it("shows demo account log", () => {
    localStorage.setItem("myBotIs", "online");
    const p = fakeProps();
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("demo");
    localStorage.setItem("myBotIs", "");
  });

  it("shows current logs", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.2.3";
    p.logs[0].body.major_version = 1;
    p.logs[0].body.minor_version = 2;
    p.logs[0].body.patch_version = 3;
    const wrapper = mount(<Logs {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
    expect(wrapper.text()).toContain("message 1");
    expect(wrapper.text()).toContain("message 2");
  });

  it("shows only current logs", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.2.3";
    p.logs[0].body.major_version = 1;
    p.logs[0].body.minor_version = 2;
    p.logs[0].body.patch_version = 3;
    const wrapper = mount(<Logs {...p} />);
    wrapper.setState({ currentFbosOnly: true });
    expect(wrapper.html()).not.toContain("fa-exclamation-triangle");
    expect(wrapper.text()).toContain("message 1");
    expect(wrapper.text()).not.toContain("message 2");
  });

  it("deletes log", () => {
    const p = fakeProps();
    const wrapper = mount(<Logs {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(p.logs[0].uuid);
  });
});

describe("<RawLogs />", () => {
  const fakeProps = (): LogsPanelProps => ({
    dispatch: jest.fn(),
  });

  it("renders page", () => {
    const p = fakeProps();
    const wrapper = mount(<RawLogs {...p} />);
    expect(wrapper.text()).toContain("moved");
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.OPEN_POPUP, payload: "jobs" });
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.SET_JOBS_PANEL_OPTION, payload: "logs" });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    expect(mapStateToProps(fakeState())).toEqual(
      expect.objectContaining({ dispatch: expect.any(Function) }));
  });
});
