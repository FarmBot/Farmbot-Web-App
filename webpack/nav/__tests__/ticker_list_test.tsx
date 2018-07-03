const mockStorj: Dictionary<number | boolean> = {};

jest.mock("../../session", () => {
  return {
    Session: {
      deprecatedGetNum: (k: string) => {
        return mockStorj[k];
      },
      deprecatedSetNum: (k: string, v: number) => {
        mockStorj[k] = v;
      },
      deprecatedGetBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      }
    },
    // tslint:disable-next-line:no-any
    safeNumericSetting: (x: any) => x

  };
});

import * as React from "react";
import { mount } from "enzyme";
import { TickerList } from "../ticker_list";
import { Dictionary } from "farmbot";
import { fakeLog } from "../../__test_support__/fake_state/resources";
import { TickerListProps } from "../interfaces";

describe("<TickerList />", () => {
  const fakeTaggedLog = () => {
    const log = fakeLog();
    log.body.message = "Farmbot is up and Running!";
    log.body.created_at = 1501703421;
    return log;
  };

  const fakeProps = (): TickerListProps => {
    return {
      timeOffset: 0,
      logs: [fakeTaggedLog(), fakeTaggedLog()],
      tickerListOpen: false,
      toggle: jest.fn(),
    };
  };

  function expectLogOccurrences(text: string, expectedCount: number) {
    const count = (text.match(/Running/g) || []).length;
    expect(count).toEqual(expectedCount);
  }

  it("shows log message and datetime", () => {
    const wrapper = mount(<TickerList {...fakeProps()} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
    expectLogOccurrences(wrapper.text(), 1);
  });

  it("shows empty log message", () => {
    const p = fakeProps();
    p.logs = [];
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("No logs yet.");
  });

  it("shows 'loading' log message", () => {
    const p = fakeProps();
    p.logs[0].body.message = "";
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Loading");
  });

  it("opens ticker", () => {
    const p = fakeProps();
    p.tickerListOpen = true;
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(5);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
    expect(labels.at(2).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
    expect(labels.at(4).text()).toEqual("Filter logs");
    expectLogOccurrences(wrapper.text(), 2);
  });

  it("all logs filtered out", () => {
    ["success", "busy", "warn", "error", "info", "fun", "debug"]
      .map(logType => mockStorj[logType + "_log"] = 0);
    const p = fakeProps();
    p.logs[0].body.verbosity = 1;
    const wrapper = mount(<TickerList {...p} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text())
      .toContain("No logs to display. Visit Logs page to view filters.");
  });
});
