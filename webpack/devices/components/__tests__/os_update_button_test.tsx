jest.mock("../../../device", () => ({
  devices: {
    current: {
      checkUpdates: jest.fn(() => { return Promise.resolve(); }),
    }
  }
}));
let mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { OsUpdateButton } from "../os_update_button";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { devices } from "../../../device";

describe("<OsUpdateButton/>", () => {
  beforeEach(function () {
    bot.currentOSVersion = "3.1.6";
    jest.clearAllMocks();
  });
  it("renders buttons: not connected", () => {
    let buttons = mount(<OsUpdateButton bot={bot} />);
    expect(buttons.find("button").length).toBe(2);
    let autoUpdate = buttons.find("button").first();
    expect(autoUpdate.hasClass("yellow")).toBeTruthy();
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("Can't Connect to release server");
  });
  it("up to date", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
  });
  it("update available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.5";
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
  });
  it("calls checkUpdates", () => {
    let { mock } = devices.current.checkUpdates as jest.Mock<{}>;
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mock.calls.length).toEqual(1);
  });
  it("shows update progress: bytes", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: 300, unit: "bytes" } };
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("300B");
  });
  it("shows update progress: kilobytes", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: 30000, unit: "bytes" } };
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("29kB");
  });
  it("shows update progress: megabytes", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: 3e6, unit: "bytes" } };
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("3MB");
  });
  it("shows update progress: percent", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", percent: 10, unit: "percent" } };
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("10%");
  });
  it("update success", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "complete", percent: 100, unit: "percent" } };
    bot.hardware.informational_settings.controller_version = "3.1.6";
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
  });
  it("update failed", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "error", percent: 10, unit: "percent" } };
    bot.hardware.informational_settings.controller_version = "3.1.5";
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
  });
  it("is disabled", () => {
    let { mock } = devices.current.checkUpdates as jest.Mock<{}>;
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", percent: 10, unit: "percent" } };
    let buttons = mount(<OsUpdateButton bot={bot} />);
    let osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mock.calls.length).toEqual(0);
  });
});
