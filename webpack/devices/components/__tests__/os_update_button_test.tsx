const mockDevice = {
  checkUpdates: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../device", () => ({
  getDevice: () => (mockDevice)
}));
const mockOk = jest.fn();
jest.mock("farmbot-toastr", () => ({ success: mockOk }));

import * as React from "react";
import { mount } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { OsUpdateButton } from "../fbos_settings/os_update_button";

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
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).toHaveBeenCalledTimes(1);
  });

  function bytesProgressTest(unit: string, progress: number, text: string) {
    it(`shows update progress: ${unit}`, () => {
      bot.hardware.jobs = { "FBOS_OTA": { status: "working", bytes: progress, unit: "bytes" } };
      const buttons = mount(<OsUpdateButton bot={bot} />);
      const osUpdateButton = buttons.find("button").last();
      expect(osUpdateButton.text()).toBe(text);
    });
  }
  bytesProgressTest("bytes", 300, "300B");
  bytesProgressTest("kilobytes", 30000, "29kB");
  bytesProgressTest("megabytes", 3e6, "3MB");

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
    bot.hardware.jobs = { "FBOS_OTA": { status: "working", percent: 10, unit: "percent" } };
    const buttons = mount(<OsUpdateButton bot={bot} />);
    const osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).not.toHaveBeenCalled();
  });
});
