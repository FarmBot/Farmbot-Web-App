jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Logs, LogsFilterMenu } from "../index";
import { Log } from "../../interfaces";

describe("<Logs />", () => {
  function fakeLogs(): Log[] {
    return [{
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
  }

  it("renders", () => {
    const wrapper = mount(<Logs logs={fakeLogs()} />);
    ["Logs", "View and filter log messages.", "Type", "Message", "Time", "Info",
      "Fake log message 1", "Success", "Fake log message 2"]
      .map(string =>
        expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("filters logs", () => {
    const wrapper = mount(<Logs logs={fakeLogs()} />);
    wrapper.setState({ info: false });
    expect(wrapper.text()).not.toContain("Fake log message 1");
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
