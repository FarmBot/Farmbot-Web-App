jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Logs } from "../index";
import { ToolTips } from "../../constants";
import { TaggedLog, SpecialStatus } from "../../resources/tagged_resources";
import { Log } from "../../interfaces";
import { generateUuid } from "../../resources/util";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<Logs />", () => {
  function fakeLogs(): TaggedLog[] {
    const logs: Log[] = [{
      id: 1,
      created_at: -1,
      message: "Fake log message 1",
      meta: {
        type: "info"
      },
      channels: []
    },
    {
      id: 2,
      created_at: -1,
      message: "Fake log message 2",
      meta: {
        type: "success"
      },
      channels: []
    }];
    return logs.map((body: Log): TaggedLog => {
      return {
        kind: "Log",
        uuid: generateUuid(body.id, "Log"),
        specialStatus: SpecialStatus.SAVED,
        body
      };
    });
  }

  it("renders", () => {
    const wrapper = mount(<Logs logs={fakeLogs()} bot={bot} />);
    ["Logs", ToolTips.LOGS, "Type", "Message", "Time", "Info",
      "Fake log message 1", "Success", "Fake log message 2"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filter");
    expect(filterBtn.hasClass("gray")).toBeTruthy();
  });

  it("filters logs", () => {
    const wrapper = mount(<Logs logs={fakeLogs()} bot={bot} />);
    wrapper.setState({ info: false });
    expect(wrapper.text()).not.toContain("Fake log message 1");
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filters active");
    expect(filterBtn.hasClass("green")).toBeTruthy();
  });

  it("shows position", () => {
    const logs = fakeLogs();
    logs[0].body.meta.x = 100;
    logs[1].body.meta.x = 0;
    logs[1].body.meta.y = 1;
    logs[1].body.meta.z = 2;
    const wrapper = mount(<Logs logs={logs} bot={bot} />);
    expect(wrapper.text()).toContain("Unknown");
    expect(wrapper.text()).toContain("0, 1, 2");
  });

  it("shows verbosity", () => {
    const logs = fakeLogs();
    logs[0].body.meta.verbosity = 999;
    const wrapper = mount(<Logs logs={logs} bot={bot} />);
    expect(wrapper.text()).toContain(999);
  });
});
