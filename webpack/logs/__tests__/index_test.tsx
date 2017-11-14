jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Logs, LogsFilterMenu } from "../index";
import { ToolTips } from "../../constants";
import { TaggedLog, SpecialStatus } from "../../resources/tagged_resources";
import { Log } from "../../interfaces";
import { generateUuid } from "../../resources/util";

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
    const wrapper = mount(<Logs logs={fakeLogs()} />);
    ["Logs", ToolTips.LOGS, "Type", "Message", "Time", "Info",
      "Fake log message 1", "Success", "Fake log message 2"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filter");
    expect(filterBtn.hasClass("gray")).toBeTruthy();
  });

  it("filters logs", () => {
    const wrapper = mount(<Logs logs={fakeLogs()} />);
    wrapper.setState({ info: false });
    expect(wrapper.text()).not.toContain("Fake log message 1");
    const filterBtn = wrapper.find("button").first();
    expect(filterBtn.text().toLowerCase()).toEqual("filters active");
    expect(filterBtn.hasClass("green")).toBeTruthy();
  });
});

describe("<LogsFilterMenu />", () => {
  const fakeState = {
    autoscroll: true, success: true, busy: true, warn: true,
    error: true, info: true, fun: true, debug: true
  };
  it("renders", () => {
    const wrapper = mount(
      <LogsFilterMenu toggle={jest.fn()} state={fakeState} />);
    ["success", "busy", "warn", "error", "info", "fun", "debug"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
    expect(wrapper.text()).not.toContain("autscroll");
  });

  it("filters logs", () => {
    const toggle = jest.fn();
    const wrapper = mount(
      <LogsFilterMenu toggle={(x) => () => toggle(x)} state={fakeState} />);
    wrapper.find("button").first().simulate("click");
    expect(toggle).toHaveBeenCalledWith("success");
  });
});
