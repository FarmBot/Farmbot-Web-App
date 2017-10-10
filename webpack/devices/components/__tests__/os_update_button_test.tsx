const mockDevice = {
  checkUpdates: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));
const mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { OsUpdateButton } from "../os_update_button";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { getDevice } from "../../../device";

describe("<OsUpdateButton/>", () => {
  beforeEach(function () {
    bot.currentOSVersion = "3.1.6";
    jest.clearAllMocks();
  });
  it("renders buttons: not connected", () => {
    const buttons = mount(<OsUpdateButton bot={bot} />);
    expect(buttons.find("button").length).toBe(2);
    const autoUpdate = buttons.find("button").first();
    expect(autoUpdate.hasClass("yellow")).toBeTruthy();
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("Can't Connect to release server");
  });
  it("up to date", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
  });
  it("update available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.5";
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
  });
  it("calls checkUpdates", () => {
    const { mock } = getDevice().checkUpdates as jest.Mock<{}>;
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mock.calls.length).toEqual(1);
  });
  it("shows update progress: bytes", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: 300, unit: "bytes" } };
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("300B");
  });
  it("shows update progress: kilobytes", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: 30000, unit: "bytes" } };
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("29kB");
  });
  it("shows update progress: megabytes", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: 3e6, unit: "bytes" } };
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("3MB");
  });
  it("shows update progress: percent", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", percent: 10, unit: "percent" } };
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("10%");
  });
  it("update success", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "complete", percent: 100, unit: "percent" } };
    bot.hardware.informational_settings.controller_version = "3.1.6";
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
  });
  it("update failed", () => {
    bot.hardware.jobs = { "FBOS_OTA": { status: "error", percent: 10, unit: "percent" } };
    bot.hardware.informational_settings.controller_version = "3.1.5";
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
  });
  it("is disabled", () => {
    const { mock } = getDevice().checkUpdates as jest.Mock<{}>;
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", percent: 10, unit: "percent" } };
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mock.calls.length).toEqual(0);
  });
});
