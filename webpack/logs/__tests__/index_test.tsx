const mockDevice = {
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Logs, LogsFilterMenu, LogsSettingsMenu } from "../index";
import { ToolTips } from "../../constants";
import { TaggedLog, SpecialStatus } from "../../resources/tagged_resources";
import { Log } from "../../interfaces";
import { generateUuid } from "../../resources/util";
import { bot } from "../../__test_support__/fake_state/bot";
import { ConfigurationName } from "farmbot";

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

describe("<LogsSettingsMenu />", () => {
  it("renders", () => {
    const wrapper = mount(<LogsSettingsMenu {...bot} />);
    ["begin", "steps", "complete"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  function testSettingToggle(setting: ConfigurationName, position: number) {
    it("toggles setting", () => {
      bot.hardware.configuration[setting] = false;
      const wrapper = mount(<LogsSettingsMenu {...bot} />);
      wrapper.find("button").at(position).simulate("click");
      expect(mockDevice.updateConfig)
        .toHaveBeenCalledWith({ [setting]: true });
    });
  }
  testSettingToggle("sequence_init_log", 0);
  testSettingToggle("sequence_body_log", 1);
  testSettingToggle("sequence_complete_log", 2);
});
