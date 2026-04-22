const mockStorj: Dictionary<number | boolean> = {};

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { LogsPanel as Logs, RawLogs } from "../index";
import { TaggedLog, Dictionary } from "farmbot";
import { NumericSetting } from "../../session_keys";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { LogsPanelProps, LogsProps } from "../interfaces";
import { MessageType } from "../../sequences/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { bot } from "../../__test_support__/fake_state/bot";
import * as crud from "../../api/crud";
import { mapStateToProps } from "../state_to_props";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

describe("<Logs />", () => {
  let destroySpy: jest.SpyInstance;

  beforeEach(() => {
    destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  });

  afterEach(() => {
    destroySpy.mockRestore();
  });

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
    sourceFbosConfig: () => ({ value: "farmduino_k14", consistent: true }),
    getConfigValue: x => mockStorj[x],
    bot: bot,
    fbosVersion: undefined,
    device: fakeDevice(),
  });

  const setStateSync = (instance: Logs) => {
    instance.setState = ((state: Partial<Logs["state"]>) => {
      instance.state = { ...instance.state, ...state };
    });
    return instance;
  };

  const renderInstance = (instance: Logs) => {
    const rendered = render(instance.render());
    const rerender = () => rendered.rerender(instance.render());
    return { ...rendered, rerender };
  };

  const verifyFilterState = (container: ParentNode, enabled: boolean) => {
    const filterBtn = container.querySelector(".fa-filter") as HTMLElement;
    expect(filterBtn).toBeTruthy();
    if (enabled) {
      expect(filterBtn.style.color).toEqual("white");
    } else {
      expect(filterBtn.style.color).toMatch(/#434343|67,\s*67,\s*67/);
    }
  };

  it("renders", () => {
    const { container } = render(<Logs {...fakeProps()} />);
    ["Message", "Time", "Fake log message 1", "Fake log message 2"]
      .map(string =>
        expect(container.textContent?.toLowerCase())
          .toContain(string.toLowerCase()));
    verifyFilterState(container, true);
    expect(container.querySelector(".logs-retention-row")?.textContent
      ?.toLowerCase()).toContain("logs older than");
  });

  it("handles unknown log type", () => {
    const p = fakeProps();
    p.logs = fakeLogs();
    p.logs[0].body.type = "unknown" as MessageType;
    const { container } = render(<Logs {...p} />);
    ["Message", "Time", "Fake log message 1", "Fake log message 2"]
      .map(string =>
        expect(container.textContent?.toLowerCase())
          .toContain(string.toLowerCase()));
    verifyFilterState(container, true);
  });

  it("shows message when logs are loading", () => {
    const p = fakeProps();
    p.logs[0].body.message = "";
    const instance = setStateSync(new Logs(p));
    instance.setState({ markdown: false });
    const { container } = renderInstance(instance);
    expect(container.textContent?.toLowerCase()).toContain("loading");
  });

  it("filters logs", () => {
    const instance = setStateSync(new Logs(fakeProps()));
    instance.setState({ info: 0 });
    const { container } = renderInstance(instance);
    expect(container.textContent).not.toContain("Fake log message 1");
    verifyFilterState(container, true);
  });

  it("doesn't show logs of any verbosity when type is disabled", () => {
    const p = fakeProps();
    p.logs[0].body.verbosity = 0;
    const notShownMessage = "This log should not be shown.";
    p.logs[0].body.message = notShownMessage;
    p.logs[0].body.type = MessageType.info;
    const instance = setStateSync(new Logs(p));
    instance.setState({ info: 0 });
    const { container } = renderInstance(instance);
    expect(container.textContent).not.toContain(notShownMessage);
  });

  it("shows position", () => {
    const p = fakeProps();
    p.logs[0].body.x = 100;
    p.logs[0].body.y = undefined;
    p.logs[0].body.z = undefined;
    p.logs[1].body.x = 0;
    p.logs[1].body.y = 1;
    p.logs[1].body.z = 2;
    const { container } = render(<Logs {...p} />);
    expect(container.textContent).toContain("Unknown");
    expect(container.textContent).toContain("0, 1, 2");
  });

  it("doesn't show negative verbosity", () => {
    const p = fakeProps();
    p.logs[0].body.verbosity = -999;
    const { container } = render(<Logs {...p} />);
    expect(container.textContent).not.toContain("-999");
  });

  it("doesn't show invalid time", () => {
    const p = fakeProps();
    p.logs[0].body.created_at = undefined;
    const { container } = render(<Logs {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("unknown");
    expect(container.textContent?.toLowerCase()).not.toContain("invalid");
  });

  it("loads filter setting", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const instance = new Logs(fakeProps());
    expect(instance.state.warn).toEqual(3);
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
    const instance = setStateSync(new Logs(fakeProps()));
    instance.setState(fakeLogsState());
    const { container } = renderInstance(instance);
    verifyFilterState(container, false);
  });

  it("shows filtered overall filter status", () => {
    const instance = setStateSync(new Logs(fakeProps()));
    const state = fakeLogsState();
    state.assertion = 2;
    instance.setState(state);
    const { container } = renderInstance(instance);
    verifyFilterState(container, true);
  });

  it("shows unfiltered overall filter status", () => {
    const instance = setStateSync(new Logs(fakeProps()));
    const state = fakeLogsState();
    state.assertion = 3;
    instance.setState(state);
    const { container } = renderInstance(instance);
    verifyFilterState(container, false);
  });

  it("toggles filter", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const instance = setStateSync(new Logs(fakeProps()));
    expect(instance.state.warn).toEqual(3);
    instance.toggle(MessageType.warn)();
    expect(instance.state.warn).toEqual(0);
    instance.toggle(MessageType.warn)();
    expect(instance.state.warn).toEqual(1);
  });

  it("toggles setting", () => {
    const instance = setStateSync(new Logs(fakeProps()));
    expect(instance.state.currentFbosOnly).toEqual(false);
    instance.toggleCurrentFbosOnly();
    expect(instance.state.currentFbosOnly).toEqual(true);
  });

  it("sets filter", () => {
    mockStorj[NumericSetting.warn_log] = 3;
    const instance = setStateSync(new Logs(fakeProps()));
    expect(instance.state.warn).toEqual(3);
    instance.setFilterLevel(MessageType.warn)(2);
    expect(instance.state.warn).toEqual(2);
  });

  it("toggles raw text display", () => {
    const instance = setStateSync(new Logs(fakeProps()));
    expect(instance.state.markdown).toBeTruthy();
    instance.toggleMarkdown();
    expect(instance.state.markdown).toBeFalsy();
  });

  it("renders formatted messages", () => {
    const p = fakeProps();
    p.logs[0].body.message = "`message`";
    const instance = setStateSync(new Logs(p));
    const { container, rerender } = renderInstance(instance);
    expect(instance.state.markdown).toBeTruthy();
    expect(container.innerHTML).toContain("<code>message</code>");
    instance.setState({ markdown: false });
    rerender();
    expect(container.innerHTML).not.toContain("<code>message</code>");
  });

  it("changes search term", () => {
    const instance = setStateSync(new Logs(fakeProps()));
    const { container } = renderInstance(instance);
    const input = container
      .querySelector("input[name='logsSearchTerm']") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "one" } });
    expect(instance.state.searchTerm).toEqual("one");
  });

  it("shows current logs", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.2.3";
    p.logs[0].body.major_version = 1;
    p.logs[0].body.minor_version = 2;
    p.logs[0].body.patch_version = 3;
    const { container } = render(<Logs {...p} />);
    expect(container.innerHTML).toContain("fa-exclamation-triangle");
    expect(container.textContent).toContain("message 1");
    expect(container.textContent).toContain("message 2");
  });

  it("shows only current logs", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.2.3";
    p.logs[0].body.major_version = 1;
    p.logs[0].body.minor_version = 2;
    p.logs[0].body.patch_version = 3;
    const instance = setStateSync(new Logs(p));
    instance.setState({ currentFbosOnly: true });
    const { container } = renderInstance(instance);
    expect(container.innerHTML).not.toContain("fa-exclamation-triangle");
    expect(container.textContent).toContain("message 1");
    expect(container.textContent).not.toContain("message 2");
  });

  it("deletes log", () => {
    const p = fakeProps();
    const { container } = render(<Logs {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(p.logs[0].uuid);
  });
});

describe("<RawLogs />", () => {
  const fakeProps = (): LogsPanelProps => ({
    dispatch: jest.fn(),
  });

  it("renders page", () => {
    const p = fakeProps();
    const { container } = render(<RawLogs {...p} />);
    expect(container.textContent).toContain("moved");
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.OPEN_POPUP, payload: "jobs" });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    expect(mapStateToProps(fakeState())).toEqual(
      expect.objectContaining({ dispatch: expect.any(Function) }));
  });
});
