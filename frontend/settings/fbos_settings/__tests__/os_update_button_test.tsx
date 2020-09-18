const mockDevice = {
  checkUpdates: jest.fn(() => Promise.resolve()),
  updateConfig: jest.fn(() => Promise.resolve()),
};
jest.mock("../../../device", () => ({ getDevice: () => mockDevice }));

let mockResponse = Promise.resolve({ data: { version: "1.1.1" } });
jest.mock("axios", () => ({
  get: jest.fn(() => mockResponse),
}));

import React from "react";
import axios from "axios";
import { mount, shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fetchReleasesFromAPI, OsUpdateButton } from "../os_update_button";
import { OsUpdateButtonProps } from "../interfaces";
import { ShouldDisplay } from "../../../devices/interfaces";
import { Actions, Content } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { API } from "../../../api";

describe("<OsUpdateButton/>", () => {
  beforeEach(() => {
    applyTestProps(defaultTestProps());
  });

  const fakeProps = (): OsUpdateButtonProps => ({
    bot,
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    botOnline: true,
    shouldDisplay: () => false,
    dispatch: jest.fn(),
  });

  interface TestProps {
    installedVersion: string | undefined;
    installedCommit: string;
    availableVersion: string | undefined;
    availableBetaVersion: string | undefined;
    availableBetaCommit: string | undefined;
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

  const updateNeeded = (version: string | undefined): Results =>
    ({
      text: `UPDATE TO ${version}`,
      title: `UPDATE TO ${version}`,
      color: "green",
      disabled: false,
    });

  const downgradeNeeded = (version: string | undefined): Results =>
    ({
      text: `DOWNGRADE TO ${version}`,
      title: `DOWNGRADE TO ${version}`,
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
      title: Content.TOO_OLD_TO_UPDATE,
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

  const applyTestProps = (testProps: TestProps) => {
    const {
      installedVersion, installedCommit, onBeta, update_available,
      availableVersion, availableBetaVersion, availableBetaCommit,
      update_channel,
    } = testProps;
    bot.hardware.informational_settings.controller_version = installedVersion;
    bot.hardware.informational_settings.commit = installedCommit;
    bot.hardware.informational_settings.currently_on_beta = onBeta;
    bot.hardware.informational_settings.update_available =
      update_available || false;
    bot.currentOSVersion = availableVersion;
    bot.currentBetaOSVersion = availableBetaVersion;
    bot.currentBetaOSCommit = availableBetaCommit;
    bot.hardware.configuration.update_channel = update_channel;
    return bot;
  };

  const testButtonState = (testProps: TestProps, expected: Results) => {
    const p = fakeProps();
    p.bot = applyTestProps(testProps);
    p.shouldDisplay = testProps.shouldDisplay;
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
    testProps.update_channel = "beta";
    const expectedResults = cantConnect("release server");
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: only beta release available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableVersion = undefined;
    testProps.availableBetaVersion = "6.1.7-beta";
    testProps.update_channel = "beta";
    const expectedResults = updateNeeded("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: no beta release available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = undefined;
    testProps.update_channel = "beta";
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

  it("considers upgrade path", () => {
    const testProps = defaultTestProps();
    testProps.availableVersion = "16.1.5";
    testProps.installedVersion = "6.1.5";
    testProps.shouldDisplay = () => false;
    const expectedResults = updateNeeded("11.1.0");
    testButtonState(testProps, expectedResults);
  });

  it("beta update available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.5";
    testProps.availableBetaVersion = "7.0.0-beta";
    testProps.update_channel = "beta";
    const expectedResults = updateNeeded("7.0.0-beta");
    testButtonState(testProps, expectedResults);
  });

  it("latest newer than beta update: latest installed", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = "6.1.6-beta";
    testProps.update_channel = "beta";
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("latest newer than beta update: beta installed", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = "6.1.6-beta";
    testProps.update_channel = "beta";
    testProps.onBeta = true;
    const expectedResults = updateNeeded("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("latest newer than beta update: beta installed (beta disabled)", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.availableBetaVersion = "6.1.6-beta";
    testProps.update_channel = "stable";
    testProps.onBeta = true;
    const expectedResults = updateNeeded("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("on latest beta update", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.7";
    testProps.availableBetaVersion = "6.1.7-beta";
    testProps.update_channel = "beta";
    testProps.onBeta = true;
    const expectedResults = upToDate("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("on latest beta update: already has beta suffix", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.7-beta";
    testProps.availableBetaVersion = "6.1.7-beta";
    testProps.update_channel = "beta";
    const expectedResults = upToDate("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("beta update has same numeric version: newer commit", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "7.0.0";
    testProps.installedCommit = "old commit";
    testProps.availableBetaVersion = "7.0.0-beta";
    testProps.availableBetaCommit = "new commit";
    testProps.update_channel = "beta";
    testProps.onBeta = true;
    const expectedResults = updateNeeded("7.0.0-beta");
    testButtonState(testProps, expectedResults);
  });

  it("handles installed version newer than available (beta enabled)", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.7";
    testProps.update_channel = "beta";
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
    testProps.update_channel = "stable";
    testProps.availableBetaVersion = "6.1.7-beta";
    const expectedResults = upToDate("6.1.6");
    testButtonState(testProps, expectedResults);
  });

  it("uses update_channel value: beta", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "6.1.6";
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.7-beta";
    const expectedResults = updateNeeded("6.1.7-beta");
    testButtonState(testProps, expectedResults);
  });

  it("compares release candidates: newer", () => {
    const testProps = defaultTestProps();
    testProps.availableVersion = "6.1.5";
    testProps.installedVersion = "6.1.6-rc1";
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.6-rc2";
    const expectedResults = updateNeeded("6.1.6-rc2");
    testButtonState(testProps, expectedResults);
  });

  it("compares release candidates: older", () => {
    const testProps = defaultTestProps();
    testProps.availableVersion = "6.1.5";
    testProps.installedVersion = "6.1.6-rc2";
    testProps.update_channel = "beta";
    testProps.availableBetaVersion = "6.1.6-rc1";
    const expectedResults = upToDate("6.1.6-rc1");
    testButtonState(testProps, expectedResults);
  });

  const apiReleasesProps = (): TestProps => ({
    installedVersion: "6.1.4",
    installedCommit: "1",
    availableVersion: "6.1.5",
    availableBetaVersion: "6.1.6-rc1",
    availableBetaCommit: "2",
    onBeta: true,
    shouldDisplay: () => true,
    update_channel: "beta",
  });

  it("ignores beta setting: upgrade", () => {
    const testProps = apiReleasesProps();
    testProps.availableVersion = "16.1.5";
    testProps.installedVersion = "6.1.4";
    const expectedResults = updateNeeded("16.1.5");
    testButtonState(testProps, expectedResults);
  });

  it("ignores beta setting: downgrade to equal", () => {
    const testProps = apiReleasesProps();
    testProps.availableVersion = "6.1.5";
    testProps.installedVersion = "6.1.5";
    const expectedResults = downgradeNeeded("6.1.5");
    testButtonState(testProps, expectedResults);
  });

  it("ignores beta setting: downgrade", () => {
    const testProps = apiReleasesProps();
    testProps.availableVersion = "6.1.4";
    testProps.installedVersion = "6.1.5";
    const expectedResults = downgradeNeeded("6.1.4");
    testButtonState(testProps, expectedResults);
  });

  it("ignores beta setting: up to date", () => {
    const testProps = apiReleasesProps();
    testProps.availableVersion = undefined;
    testProps.installedVersion = "6.1.5";
    const expectedResults = upToDate(undefined);
    testButtonState(testProps, expectedResults);
  });

  it("fetches releases from API", async () => {
    console.error = jest.fn();
    API.setBaseUrl("");
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.bot.hardware.informational_settings.target = "rpi";
    const button = shallow(<OsUpdateButton {...p} />);
    await button.simulate("pointerEnter");
    expect(axios.get).toHaveBeenCalledWith(
      "http://localhost/api/releases?platform=rpi");
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: "1.1.1" },
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("calls checkUpdates", () => {
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    osUpdateButton.simulate("click");
    expect(mockDevice.checkUpdates).toHaveBeenCalledTimes(1);
  });

  it("handles undefined jobs", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe("fetchReleasesFromAPI()", () => {
  API.setBaseUrl("");

  it("doesn't fetch version", async () => {
    const innerDispatch = jest.fn();
    const outerDispatch = mockDispatch(innerDispatch);
    console.error = jest.fn();
    await fetchReleasesFromAPI("---")(outerDispatch);
    await expect(axios.get).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("Platform not available.");
    expect(innerDispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: undefined },
    });
  });

  it("fetches version", async () => {
    mockResponse = Promise.resolve({ data: { version: "1.1.1" } });
    const innerDispatch = jest.fn();
    const outerDispatch = mockDispatch(innerDispatch);
    console.error = jest.fn();
    await fetchReleasesFromAPI("rpi")(outerDispatch);
    await expect(axios.get).toHaveBeenCalledWith(
      "http://localhost/api/releases?platform=rpi");
    expect(console.error).not.toHaveBeenCalled();
    expect(outerDispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: "1.1.1" },
    });
  });

  it("errors while fetching version: already up to date", async () => {
    mockResponse = Promise.reject({ data: { version: "error" } });
    const innerDispatch = jest.fn();
    const outerDispatch = mockDispatch(innerDispatch);
    console.error = jest.fn();
    await fetchReleasesFromAPI("rpi")(outerDispatch);
    await expect(axios.get).toHaveBeenCalledWith(
      "http://localhost/api/releases?platform=rpi");
    await expect(console.error).toHaveBeenCalledWith({
      data: { version: "error" }
    });
    expect(console.error).toHaveBeenCalledWith(
      "Could not download FarmBot OS update information.");
    expect(innerDispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: undefined },
    });
  });

  it("errors while fetching version: no releases available", async () => {
    mockResponse = Promise.reject("error 404");
    const innerDispatch = jest.fn();
    const outerDispatch = mockDispatch(innerDispatch);
    console.error = jest.fn();
    await fetchReleasesFromAPI("rpi")(outerDispatch);
    await expect(axios.get).toHaveBeenCalledWith(
      "http://localhost/api/releases?platform=rpi");
    await expect(console.error).toHaveBeenCalledWith("error 404");
    expect(console.error).toHaveBeenCalledWith(
      "Could not download FarmBot OS update information.");
    expect(console.error).toHaveBeenCalledWith(
      "No releases found for platform and channel.");
    expect(innerDispatch).toHaveBeenCalledWith({
      type: Actions.FETCH_OS_UPDATE_INFO_OK,
      payload: { version: undefined },
    });
  });
});
