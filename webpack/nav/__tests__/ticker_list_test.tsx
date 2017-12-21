const mockStorj: Dictionary<number | boolean> = {};

jest.mock("../../session", () => {
  return {
    Session: {
      getNum: (k: string) => {
        return mockStorj[k];
      },
      setNum: (k: string, v: number) => {
        mockStorj[k] = v;
      },
      getBool: (k: string) => {
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
        logs={[log]}
        tickerListOpen={false}
        toggle={jest.fn()} />
    );
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toContain("Aug 2");
    expect(labels.at(1).text()).toContain(":50pm");
    // TODO: Change the above two lines to the line below when
    //       bot timezone display is implemented in the web app.
    //       Do the same in the "opens ticker" test below.
    // expect(labels.at(1).text()).toEqual("Aug 2, 7:50pm");
  });

  it("shows empty log message", () => {
    const wrapper = mount(
      <TickerList
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
        logs={[log, log]}
        tickerListOpen={true}
        toggle={jest.fn()} />
    );
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(5);
    expect(labels.at(0).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(1).text()).toContain("Aug 2");
    expect(labels.at(1).text()).toContain(":50pm");
    expect(labels.at(2).text()).toContain("Farmbot is up and Running!");
    expect(labels.at(3).text()).toContain("Aug 2");
    expect(labels.at(3).text()).toContain(":50pm");
    expect(labels.at(4).text()).toEqual("Filter logs");
  });

  it("all logs filtered out", () => {
    ["success", "busy", "warn", "error", "info", "fun", "debug"]
      .map(logType => mockStorj[logType + "Log"] = 0);
    log.meta.verbosity = 1;
    const wrapper = mount(<TickerList
      logs={[log]} tickerListOpen={false} toggle={jest.fn()} />);
    const labels = wrapper.find("label");
    expect(labels.length).toEqual(2);
    expect(labels.at(0).text())
      .toContain("No logs to display. Visit Logs page to view filters.");
  });
});
