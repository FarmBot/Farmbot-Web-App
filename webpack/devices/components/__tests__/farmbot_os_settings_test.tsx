let mockReleaseNoteData = {};
jest.mock("axios", () => ({
  default: {
    get: jest.fn(() => { return Promise.resolve(mockReleaseNoteData); })
  }
}));

import * as React from "react";
import { FarmbotOsSettings } from "../farmbot_os_settings";
import { mount, shallow } from "enzyme";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeResource } from "../../../__test_support__/fake_resource";
import { FarmbotOsProps } from "../../interfaces";
import axios from "axios";
import { Actions } from "../../../constants";
import { SpecialStatus } from "farmbot";

describe("<FarmbotOsSettings/>", () => {
  beforeEach(() => {
    window.alert = jest.fn();
  });

  const fakeProps = (): FarmbotOsProps => {
    return {
      account: fakeResource("Device", { id: 0, name: "", tz_offset_hrs: 0 }),
      diagnostics: [],
      dispatch: jest.fn(),
      bot,
      botToMqttLastSeen: "",
      botToMqttStatus: "up",
      sourceFbosConfig: (x) => {
        return { value: bot.hardware.configuration[x], consistent: true };
      },
      shouldDisplay: jest.fn(),
      isValidFbosConfig: false,
    };
  };

  it("renders settings", () => {
    const osSettings = mount(<FarmbotOsSettings {...fakeProps()} />);
    expect(osSettings.find("input").length).toBe(1);
    expect(osSettings.find("button").length).toBe(7);
    ["NAME", "TIME ZONE", "LAST SEEN", "FARMBOT OS", "CAMERA", "FIRMWARE"]
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
    const osSettings = shallow(<FarmbotOsSettings {...p} />);
    osSettings.find("input")
      .simulate("change", { currentTarget: { value: "new bot name" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { name: "new bot name" },
        uuid: expect.stringContaining("Device")
      },
      type: Actions.EDIT_RESOURCE
    });
  });

});
