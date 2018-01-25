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
import { Log } from "../../interfaces";
import { Dictionary } from "farmbot";

describe("<TickerList />", () => {
  const log: Log = {
    id: 1234567,
    message: "Farmbot is up and Running!",
    meta: {
      type: "info"
    },
    channels: [
      "toast"
    ],
    created_at: 1501703421
  };

  it("shows log message and datetime", () => {
    const wrapper = mount(
      <TickerList
        timeOffset={0}
        logs={[log]}
        tickerListOpen={false}
        toggle={jest.fn()} />
    );
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
  });

  it("shows empty log message", () => {
    const wrapper = mount(
      <TickerList
        timeOffset={0}
        logs={[]}
        tickerListOpen={false}
        toggle={jest.fn()} />
    );
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("No logs yet.");
  });

  it("opens ticker", () => {
    const wrapper = mount(
      <TickerList
        timeOffset={0}
        logs={[log, log]}
        tickerListOpen={true}
        toggle={jest.fn()} />
    );
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(5);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
    expect(labels.at(2).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
    expect(labels.at(4).text()).toEqual("Filter logs");
  });

  it("all logs filtered out", () => {
    ["success", "busy", "warn", "error", "info", "fun", "debug"]
      .map(logType => mockStorj[logType + "_log"] = 0);
    log.meta.verbosity = 1;
    const wrapper = mount(<TickerList
      logs={[log]} tickerListOpen={false} toggle={jest.fn()} timeOffset={0} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text())
      .toContain("No logs to display. Visit Logs page to view filters.");
  });
});
