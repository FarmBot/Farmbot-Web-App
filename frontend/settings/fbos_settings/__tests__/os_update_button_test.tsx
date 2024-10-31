jest.mock("../../../devices/actions", () => ({
  checkControllerUpdates: jest.fn(),
}));

jest.mock("../../toggle_section", () => ({
  bulkToggleControlPanel: jest.fn(),
  toggleControlPanel: jest.fn(),
}));

let mockResponse = Promise.resolve({ data: { version: "1.1.1" } });
jest.mock("axios", () => ({ get: jest.fn(() => mockResponse) }));

import React from "react";
import axios from "axios";
import { mount, shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fetchOsUpdateVersion, OsUpdateButton } from "../os_update_button";
import { OsUpdateButtonProps } from "../interfaces";
import { Actions, Content } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { API } from "../../../api";
import { cloneDeep } from "lodash";
import { checkControllerUpdates } from "../../../devices/actions";
import { toggleControlPanel } from "../../toggle_section";
import {
  fakeBytesJob, fakePercentJob,
} from "../../../__test_support__/fake_bot_data";
import { Path } from "../../../internal_urls";

describe("<OsUpdateButton />", () => {
  const fakeProps = (): OsUpdateButtonProps => ({
    bot: cloneDeep(bot),
    botOnline: true,
    dispatch: jest.fn(),
  });

  interface TestProps {
    installedVersion: string | undefined;
    availableVersion: string | undefined;
  }

  const defaultTestProps = (): TestProps => ({
    installedVersion: "12.0.0",
    availableVersion: undefined,
  });

  interface Results {
    text: string;
    title: string | undefined;
    color: string;
    disabled: boolean;
  }

  const updateNeeded = (version: string | undefined): Results => ({
    text: `UPDATE TO ${version}`,
    title: `UPDATE TO ${version}`,
    color: "green",
    disabled: false,
  });

  const downgradeNeeded = (version: string | undefined): Results => ({
    text: `DOWNGRADE TO ${version}`,
    title: `DOWNGRADE TO ${version}`,
    color: "green",
    disabled: false,
  });

  const upToDate = (title: string | undefined): Results => ({
    text: "UP TO DATE",
    title,
    color: "gray",
    disabled: false,
  });

  const cantConnect = (title: string | undefined): Results => ({
    text: "Can't connect to bot",
    title,
    color: "yellow",
    disabled: false,
  });

  const tooOld = (): Results => ({
    text: Content.TOO_OLD_TO_UPDATE,
    title: Content.TOO_OLD_TO_UPDATE,
    color: "yellow",
    disabled: false,
  });

  const updating = (progress: string): Results => ({
    text: progress,
    title: undefined,
    color: "green",
    disabled: true,
  });

  const testButtonState = (testProps: TestProps, expected: Results) => {
    const p = fakeProps();
    const { installedVersion, availableVersion } = testProps;
    p.bot.hardware.informational_settings.controller_version = installedVersion;
    p.bot.osUpdateVersion = availableVersion;
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
    testProps.availableVersion = "12.0.0";
    const expectedResults = tooOld();
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: not connected", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = undefined;
    testProps.availableVersion = "12.0.0";
    const expectedResults = cantConnect("12.0.0");
    testButtonState(testProps, expectedResults);
  });

  it("renders buttons: no releases available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "12.0.0";
    testProps.availableVersion = undefined;
    const expectedResults = upToDate(undefined);
    testButtonState(testProps, expectedResults);
  });

  it("up to date", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "12.0.0";
    testProps.availableVersion = undefined;
    const expectedResults = upToDate(undefined);
    testButtonState(testProps, expectedResults);
  });

  it("downgrade to equal", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "12.0.0";
    testProps.availableVersion = "12.0.0";
    const expectedResults = downgradeNeeded("12.0.0");
    testButtonState(testProps, expectedResults);
  });

  it("downgrade", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "13.0.0";
    testProps.availableVersion = "12.0.0";
    const expectedResults = downgradeNeeded("12.0.0");
    testButtonState(testProps, expectedResults);
  });

  it("update available", () => {
    const testProps = defaultTestProps();
    testProps.installedVersion = "12.0.0";
    testProps.availableVersion = "13.0.0";
    const expectedResults = updateNeeded("13.0.0");
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
    expect(checkControllerUpdates).toHaveBeenCalledTimes(1);
  });

  it("calls onTooOld", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    const buttons = mount(<OsUpdateButton {...p} />);
    const osUpdateButton = buttons.find("button").first();
    osUpdateButton.simulate("click");
    expect(checkControllerUpdates).not.toHaveBeenCalled();
    expect(toggleControlPanel).toHaveBeenCalledWith("power_and_reset");
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("hard_reset"));
  });

  it("handles undefined jobs", () => {
    const p = fakeProps();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    p.bot.hardware.jobs = undefined as any;
    p.bot.hardware.informational_settings.controller_version = "12.0.0";
    p.bot.osUpdateVersion = undefined;
    const buttons = mount(<OsUpdateButton {...p} />);
    const osUpdateButton = buttons.find("button").first();
    expect(osUpdateButton.text()).toEqual("UP TO DATE");
  });

  it.each<[string, number]>([
    ["300B", 300],
    ["29kB", 30000],
    ["3MB", 3e6],
  ])("shows bytes update progress: %s", (expected, progress) => {
    bot.hardware.jobs = {
      "FBOS_OTA": fakeBytesJob({ bytes: progress }),
    };
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    expect(osUpdateButton.text()).toBe(expected);
  });

  it("shows percent update progress: 10%", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": fakePercentJob({ percent: 10 }),
    };
    const testProps = defaultTestProps();
    testProps.installedVersion = "12.0.0";
    testProps.availableVersion = "13.0.0";
    const expectedResults = updating("10%");
    expectedResults.title = "UPDATE TO 13.0.0";
    testButtonState(testProps, expectedResults);
  });

  it("update success", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": fakePercentJob({ status: "complete", percent: 100 }),
    };
    testButtonState(defaultTestProps(), upToDate(undefined));
  });

  it("update failed", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": fakePercentJob({ status: "error", percent: 10 }),
    };
    const testProps = defaultTestProps();
    testProps.installedVersion = "12.0.0";
    testProps.availableVersion = "13.0.0";
    testButtonState(testProps, updateNeeded("13.0.0"));
  });

  it("is disabled", () => {
    bot.hardware.jobs = {
      "FBOS_OTA": fakePercentJob({ percent: 10 }),
    };
    const buttons = mount(<OsUpdateButton {...fakeProps()} />);
    const osUpdateButton = buttons.find("button").first();
    osUpdateButton.simulate("click");
    expect(checkControllerUpdates).not.toHaveBeenCalled();
  });
});

describe("fetchOsUpdateVersion()", () => {
  API.setBaseUrl("");

  it("doesn't fetch version", async () => {
    const innerDispatch = jest.fn();
    const outerDispatch = mockDispatch(innerDispatch);
    console.error = jest.fn();
    await fetchOsUpdateVersion("---")(outerDispatch);
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
    await fetchOsUpdateVersion("rpi")(outerDispatch);
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
    await fetchOsUpdateVersion("rpi")(outerDispatch);
    await expect(axios.get).toHaveBeenCalledWith(
      "http://localhost/api/releases?platform=rpi");
    await expect(console.error).toHaveBeenCalledWith(
      JSON.stringify({ data: { version: "error" } }));
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
    await fetchOsUpdateVersion("rpi")(outerDispatch);
    await expect(axios.get).toHaveBeenCalledWith(
      "http://localhost/api/releases?platform=rpi");
    await expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("error 404"));
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
