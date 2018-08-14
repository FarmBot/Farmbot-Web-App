const mockDevice = {
  checkUpdates: jest.fn(() => { return Promise.resolve(); }),
  updateConfig: jest.fn(() => { return Promise.resolve(); }),
};
jest.mock("../../../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { OsUpdateButton } from "../os_update_button";
import { OsUpdateButtonProps } from "../interfaces";

describe("<OsUpdateButton/>", () => {
  beforeEach(function () {
    bot.currentOSVersion = "3.1.6";
    bot.hardware.configuration.beta_opt_in = false;
  });

  const fakeProps = (): OsUpdateButtonProps => {
    return {
      bot,
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      },
      botOnline: true,
    };
  };

  it("renders buttons: not connected", () => {
    bot.hardware.informational_settings.controller_version = undefined;
    bot.currentOSVersion = undefined;
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    expect(buttons.find("button").length).toBe(1);
    const autoUpdate = buttons.find("button").first();
    expect(autoUpdate.hasClass("yellow")).toBeTruthy();
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("Can't connect to bot");
  });
  it("renders buttons: connected to releases but not bot", () => {
    bot.hardware.informational_settings.controller_version = undefined;
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    expect(buttons.find("button").length).toBe(1);
    const autoUpdate = buttons.find("button").first();
    expect(autoUpdate.hasClass("yellow")).toBeTruthy();
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("Can't connect to bot");
  });
  it("renders buttons: no releases available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    bot.hardware.configuration.beta_opt_in = true;
    bot.currentOSVersion = undefined;
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("Can't connect to release server");
  });
  it("renders buttons: only beta release available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    bot.hardware.configuration.beta_opt_in = true;
    bot.currentOSVersion = undefined;
    bot.currentBetaOSVersion = "3.1.7-beta";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
  });
  it("renders buttons: no beta release available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    bot.hardware.configuration.beta_opt_in = true;
    bot.currentBetaOSVersion = undefined;
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
  });
  it("up to date", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
    expect(osUpdateButton.props().title).toBe("3.1.6");
  });
  it("up to date: newer", () => {
    bot.hardware.informational_settings.controller_version = "5.0.0";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
    expect(osUpdateButton.props().title).toBe("3.1.6");
  });
  it("update available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.5";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
    expect(osUpdateButton.props().title).toBe("3.1.6");
  });
  it("beta update available", () => {
    bot.hardware.informational_settings.controller_version = "3.1.5";
    bot.hardware.configuration.beta_opt_in = true;
    bot.currentBetaOSVersion = "5.0.0-beta";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
    expect(osUpdateButton.props().title).toBe("5.0.0-beta");
  });
  it("latest newer than beta update: latest installed", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    bot.hardware.configuration.beta_opt_in = true;
    bot.currentBetaOSVersion = "3.1.6-beta";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
    expect(osUpdateButton.props().title).toBe("3.1.6");
  });
  it("latest newer than beta update: beta installed", () => {
    bot.hardware.informational_settings.controller_version = "3.1.6";
    bot.hardware.configuration.beta_opt_in = true;
    // tslint:disable-next-line:no-any
    (bot.hardware.informational_settings as any).currently_on_beta = true;
    bot.currentBetaOSVersion = "3.1.6-beta";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
    expect(osUpdateButton.props().title).toBe("3.1.6");
  });
  it("beta update has same numeric version: newer commit", () => {
    bot.hardware.informational_settings.controller_version = "5.0.0";
    bot.hardware.informational_settings.commit = "old commit";
    bot.hardware.configuration.beta_opt_in = true;
    bot.currentBetaOSVersion = "5.0.0-beta";
    bot.currentBetaOSCommit = "new commit";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
    expect(osUpdateButton.props().title).toBe("5.0.0-beta");
  });
  it("calls checkUpdates", () => {
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).toHaveBeenCalledTimes(1);
  });

  function bytesProgressTest(unit: string, progress: number, text: string) {
    it(`shows update progress: ${unit}`, () => {
      bot.hardware.jobs = {
        "FBOS_OTA": { status: "working", bytes: progress, unit: "bytes" }
      };
      const buttons = mount(<OsUpdateButton {...fakeProps()} />);
      const osUpdateButton = buttons.find("button").last();
      expect(osUpdateButton.text()).toBe(text);
    });
  }
  bytesProgressTest("bytes", 300, "300B");
  bytesProgressTest("kilobytes", 30000, "29kB");
  bytesProgressTest("megabytes", 3e6, "3MB");

  it("shows update progress: percent", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "working", percent: 10, unit: "percent" }
    };
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("10%");
  });
  it("update success", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "complete", percent: 100, unit: "percent" }
    };
    bot.hardware.informational_settings.controller_version = "3.1.6";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UP TO DATE");
  });
  it("update failed", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "error", percent: 10, unit: "percent" }
    };
    bot.hardware.informational_settings.controller_version = "3.1.5";
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    expect(osUpdateButton.text()).toBe("UPDATE");
  });
  it("is disabled", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "working", percent: 10, unit: "percent" }
    };
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").last();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).not.toHaveBeenCalled();
  });
});
