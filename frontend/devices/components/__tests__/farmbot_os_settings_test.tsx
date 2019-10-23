let mockReleaseNoteData = {};
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve(mockReleaseNoteData))
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

jest.mock("../fbos_settings/boot_sequence_selector", () => ({
  BootSequenceSelector: () => <div />
}));

import * as React from "react";
import { FarmbotOsSettings } from "../farmbot_os_settings";
import { mount, shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeResource } from "../../../__test_support__/fake_resource";
import { FarmbotOsProps } from "../../interfaces";
import axios from "axios";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { edit } from "../../../api/crud";

describe("<FarmbotOsSettings />", () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  const fakeProps = (): FarmbotOsProps => ({
    deviceAccount: fakeResource("Device", { id: 0, name: "", tz_offset_hrs: 0 }),
    diagnostics: [],
    dispatch: jest.fn(),
    bot,
    alerts: [],
    botToMqttLastSeen: 0,
    botToMqttStatus: "up",
    sourceFbosConfig: x =>
      ({ value: bot.hardware.configuration[x], consistent: true }),
    shouldDisplay: jest.fn(),
    isValidFbosConfig: false,
    env: {},
    saveFarmwareEnv: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("renders settings", () => {
    const osSettings = mount(<FarmbotOsSettings {...fakeProps()} />);
    expect(osSettings.find("input").length).toBe(1);
    expect(osSettings.find("button").length).toBe(6);
    ["NAME", "TIME ZONE", "FARMBOT OS", "CAMERA", "FIRMWARE"]
      .map(string => expect(osSettings.text()).toContain(string));
  });

  it("fetches OS release notes", async () => {
    mockReleaseNoteData = { data: "intro\n\n# v6\n\n* note" };
    const osSettings = await mount<FarmbotOsSettings>(<FarmbotOsSettings
      {...fakeProps()} />);
    await expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("RELEASE_NOTES.md"));
    expect(osSettings.instance().state.osReleaseNotesHeading)
      .toEqual("FarmBot OS v6");
    expect(osSettings.instance().state.osReleaseNotes)
      .toEqual("* note");
  });

  it("doesn't fetch OS release notes", async () => {
    mockReleaseNoteData = { data: "empty notes" };
    const osSettings = await mount<FarmbotOsSettings>(<FarmbotOsSettings
      {...fakeProps()} />);
    await expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("RELEASE_NOTES.md"));
    expect(osSettings.instance().state.osReleaseNotes)
      .toEqual("Could not get release notes.");
  });

  it("changes bot name", () => {
    const p = fakeProps();
    const newName = "new bot name";
    const osSettings = shallow(<FarmbotOsSettings {...p} />);
    osSettings.find("input")
      .simulate("change", { currentTarget: { value: newName } });
    expect(edit).toHaveBeenCalledWith(p.deviceAccount, { name: newName });
  });
});
