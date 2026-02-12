const mockStorj: Dictionary<number | boolean> = {};

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { TickerList } from "../ticker_list";
import { Dictionary } from "farmbot";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { TickerListProps } from "../interfaces";
import { MESSAGE_TYPES } from "../../sequences/interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Actions } from "../../constants";

describe("<TickerList />", () => {
  beforeEach(() => {
    Object.keys(mockStorj).map(key => delete mockStorj[key]);
  });

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
    getConfigValue: x => mockStorj[x],
    botOnline: true,
    lastSeen: 0,
  });

  function expectLogOccurrences(text: string, expectedCount: number) {
    const count = (text.match(/Running/g) || []).length;
    expect(count).toEqual(expectedCount);
  }

  it("shows log message and datetime", () => {
    const { container } = render(<TickerList {...fakeProps()} />);
    const labels = container.querySelectorAll("label");
    expect(labels.length).toEqual(2);
    expect(labels[0]?.textContent).toContain("Farmbot is up and Running!");
    expect(labels[1]?.textContent).toEqual("AUG 2, 7:50PM");
    expectLogOccurrences(container.textContent || "", 1);
  });

  it("opens logs popup", () => {
    const p = fakeProps();
    const { container } = render(<TickerList {...p} />);
    fireEvent.click(container.querySelector(".ticker-list") as Element);
    expect(p.dispatch).toHaveBeenCalledWith(
      { type: Actions.TOGGLE_POPUP, payload: "jobs" });
  });

  it("shows bot offline log message", () => {
    const p = fakeProps();
    p.botOnline = false;
    p.lastSeen = 1501703421000;
    const { container } = render(<TickerList {...p} />);
    const labels = container.querySelectorAll("label");
    expect(labels.length).toEqual(2);
    expect(labels[0]?.textContent).toContain("FarmBot is offline");
    expect(labels[1]?.textContent).toEqual("Last seen AUG 2, 7:50PM");
  });

  it("shows empty log message", () => {
    const p = fakeProps();
    p.logs = [];
    const { container } = render(<TickerList {...p} />);
    const labels = container.querySelectorAll("label");
    expect(labels.length).toEqual(2);
    expect(labels[0]?.textContent).toContain("No logs yet.");
    expect(labels[1]?.textContent).toEqual("");
  });

  it("shows 'loading' log message", () => {
    const p = fakeProps();
    p.logs[0].body.message = "";
    p.logs[0].body.created_at = undefined;
    const { container } = render(<TickerList {...p} />);
    const labels = container.querySelectorAll("label");
    expect(labels.length).toEqual(2);
    expect(labels[0]?.textContent).toContain("Loading");
    expect(labels[1]?.textContent).toEqual("");
  });

  it("all logs filtered out", () => {
    MESSAGE_TYPES.map(logType => mockStorj[logType + "_log"] = 0);
    const p = fakeProps();
    p.logs[0].body.verbosity = 1;
    const { container } = render(<TickerList {...p} />);
    const labels = container.querySelectorAll("label");
    expect(labels.length).toEqual(2);
    expect(labels[0]?.textContent)
      .toContain("No logs to display. Visit Logs page to view filters.");
    expect(labels[1]?.textContent).toEqual("");
  });
});
