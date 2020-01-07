const mockDevice = {
  checkUpdates: jest.fn(() => Promise.resolve()),
  updateConfig: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { mount } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";
import { OsUpdateButton } from "../os_update_button";
import { OsUpdateButtonProps } from "../interfaces";
import { ShouldDisplay } from "../../../interfaces";
import { Content } from "../../../../constants";

describe("<OsUpdateButton/>", () => {
  beforeEach(() => {
    bot.currentOSVersion = "6.1.6";
    bot.hardware.informational_settings.controller_version = "6.1.6";
    bot.hardware.configuration.beta_opt_in = false;
  });

  const fakeProps = (): OsUpdateButtonProps => ({
    bot,
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    botOnline: true,
    shouldDisplay: () => false,
  });

  interface TestProps {
    installedVersion: string | undefined;
    installedCommit: string;
    availableVersion: string | undefined;
    availableBetaVersion: string | undefined;
    availableBetaCommit: string | undefined;
    betaOptIn: boolean | undefined;
    onBeta: boolean | undefined;
    update_available?: boolean | undefined;
    shouldDisplay: ShouldDisplay;
    update_channel: string;
  }

  const defaultTestProps = (): TestProps => ({
    installedVersion: "6.1.6",
    installedCommit: "",
    availableVersion: "6.1.6",
    availableBetaVersion: undefined,
    availableBetaCommit: undefined,
    betaOptIn: false,
    onBeta: false,
    shouldDisplay: () => false,
    update_channel: "stable",
  });

  interface Results {
    text: string;
    title: string | undefined;
    color: string;
    disabled: boolean;
  }

  const updateNeeded = (title: string | undefined): Results =>
    ({
      text: "UPDATE",
      title,
      color: "green",
      disabled: false,
    });

  const upToDate = (title: string | undefined): Results =>
    ({
      text: "UP TO DATE",
      title,
      color: "gray",
      disabled: false,
    });

  const cantConnect = (entity: string): Results =>
    ({
      text: `Can't connect to ${entity}`,
      title: undefined,
      color: "yellow",
      disabled: false,
    });

  const tooOld = (): Results =>
    ({
      text: Content.TOO_OLD_TO_UPDATE,
      title: "6.1.6",
      color: "yellow",
      disabled: false,
    });

  const updating = (progress: string): Results =>
    ({
      text: progress,
      title: undefined,
      color: "gray",
      disabled: true,
    });

  const testButtonState = (
    testProps: TestProps,
    expected: Results) => {
    const {
      installedVersion, installedCommit, onBeta, update_available,
      availableVersion, availableBetaVersion, availableBetaCommit, betaOptIn,
      shouldDisplay, update_channel,
    } = testProps;
    bot.hardware.informational_settings.controller_version = installedVersion;
    bot.hardware.informational_settings.commit = installedCommit;
    bot.hardware.informational_settings.currently_on_beta = onBeta;
    bot.hardware.informational_settings.update_available =
      update_available || false;
    bot.currentOSVersion = availableVersion;
    bot.currentBetaOSVersion = availableBetaVersion;
    bot.currentBetaOSCommit = availableBetaCommit;
    bot.hardware.configuration.beta_opt_in = betaOptIn;
    // tslint:disable-next-line:no-any
    (bot.hardware.configuration as any).update_channel = update_channel;

    const p = fakeProps();
    p.shouldDisplay = shouldDisplay;
    const buttons = mount(<OsUpdateButton {...p} />);
    const osUpdateButton = buttons.find("button").first();
    expect(osUpdateButton.text()).toBe(expected.text);
    expect(osUpdateButton.props().title).toBe(expected.title);
    expect(osUpdateButton.hasClass(expected.color)).toBe(true);
    expect((osUpdateButton.props().disabled)).toBe(expected.disabled);
  };

  it("renders buttons: too old", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "5.0.0";
    const expectedResults = tooOld();
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: not connected", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = undefined;
    testProps.availableVersion = undefined;
    const expectedResults = cantConnect("bot");
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: connected to releases but not bot", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = undefined;
    const expectedResults = cantConnect("bot");
    expectedResults.title = "6.1.6";
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: no releases available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableVersion = undefined;
    testProps.betaOptIn = true;
    const expectedResults = cantConnect("release server");
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: only beta release available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableVersion = undefined;
    testProps.availableBetaVersion = "6.1.7-beta";
    testProps.betaOptIn = true;
    const expectedResults = updateNeeded("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: no beta release available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = undefined;
    testProps.betaOptIn = true;
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("up to date", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("up to date: newer", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "7.0.0";
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("update available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.5";
    const expectedResults = updateNeeded("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("beta update available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.5";
    testProps.availableBetaVersion = "7.0.0-beta";
    testProps.betaOptIn = true;
    const expectedResults = updateNeeded("7.0.0-beta");
    testButtonState(testProps, expectedResults);
  });

  it("latest newer than beta update: latest installed", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = "6.1.6-beta";
    testProps.betaOptIn = true;
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("latest newer than beta update: beta installed", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = "6.1.6-beta";
    testProps.betaOptIn = true;
    testProps.onBeta = true;
    const expectedResults = updateNeeded("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("latest newer than beta update: beta installed (beta disabled)", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = "6.1.6-beta";
    testProps.betaOptIn = false;
    testProps.onBeta = true;
    const expectedResults = updateNeeded("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("on latest beta update", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.7";
    testProps.availableBetaVersion = "6.1.7-beta";
    testProps.betaOptIn = true;
    testProps.onBeta = true;
    const expectedResults = upToDate("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("on latest beta update: already has beta suffix", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.7-beta";
    testProps.availableBetaVersion = "6.1.7-beta";
    testProps.betaOptIn = true;
    const expectedResults = upToDate("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("beta update has same numeric version: newer commit", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "7.0.0";
    testProps.installedCommit = "old commit";
    testProps.availableBetaVersion = "7.0.0-beta";
    testProps.availableBetaCommit = "new commit";
    testProps.betaOptIn = true;
    testProps.onBeta = true;
    const expectedResults = updateNeeded("7.0.0-beta");
    testButtonState(testProps, expectedResults);
  });

  it("handles installed version newer than available (beta enabled)", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.7";
    testProps.betaOptIn = true;
    testProps.onBeta = false;
    testProps.availableBetaVersion = "6.1.7-beta";
    const expectedResults = upToDate("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("handles FBOS update available override", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.update_available = true;
    const expectedResults = updateNeeded("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("uses update_channel value", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.shouldDisplay = () => true;
    testProps.update_channel = "stable";
    testProps.availableBetaVersion = "6.1.7-beta";
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("uses update_channel value: beta", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.shouldDisplay = () => true;
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.7-beta";
    const expectedResults = updateNeeded("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("doesn't use update_channel value", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.shouldDisplay = () => false;
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.7-beta";
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("compares release candidates: newer", () => {
    const testProps = defaultTestProps();
    testProps.availableVersion = "6.1.5";
    testProps.installedVersion = "6.1.6-rc1";
    testProps.shouldDisplay = () => true;
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.6-rc2";
    const expectedResults = updateNeeded("6.1.6-rc2");
    testButtonState(testProps, expectedResults);
  });

  it("compares release candidates: older", () => {
    const testProps = defaultTestProps();
    testProps.availableVersion = "6.1.5";
    testProps.installedVersion = "6.1.6-rc2";
    testProps.shouldDisplay = () => true;
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.6-rc1";
    const expectedResults = upToDate("6.1.6-rc1");
    testButtonState(testProps, expectedResults);
  });

  it("calls checkUpdates", () => {
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).toHaveBeenCalledTimes(1);
  });

  it("handles undefined jobs", () => {
    // tslint:disable-next-line:no-any
    bot.hardware.jobs = undefined as any;
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    expect(osUpdateButton.text()).toEqual("UP TO DATE");
  });

  it.each<[string, number]>([
    ["300B", 300],
    ["29kB", 30000],
    ["3MB", 3e6],
  ])("shows bytes update progress: %s", (expected, progress) => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "working", bytes: progress, unit: "bytes" }
    };
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    expect(osUpdateButton.text()).toBe(expected);
  });

  it("shows percent update progress: 10%", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "working", percent: 10, unit: "percent" }
    };
    const expectedResults = updating("10%");
    expectedResults.title = "6.1.6";
    testButtonState(defaultTestProps(), expectedResults);
  });

  it("update success", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "complete", percent: 100, unit: "percent" }
    };
    testButtonState(defaultTestProps(), upToDate("6.1.6"));
  });

  it("update failed", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "error", percent: 10, unit: "percent" }
    };
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.5";
    testButtonState(testProps, updateNeeded("6.1.6"));
  });

  it("is disabled", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": { status: "working", percent: 10, unit: "percent" }
    };
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).not.toHaveBeenCalled();
  });
});
