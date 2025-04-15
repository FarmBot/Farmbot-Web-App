jest.mock("../os_update_button", () => ({
  fetchOsUpdateVersion: jest.fn(),
  OsUpdateButton: () => <div />,
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FarmbotOsRow, getOsReleaseNotesForVersion } from "../farmbot_os_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { FarmbotOsRowProps } from "../interfaces";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { fetchOsUpdateVersion } from "../os_update_button";
import { cloneDeep } from "lodash";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("<FarmbotOsRow />", () => {
  const fakeProps = (): FarmbotOsRowProps => ({
    bot: cloneDeep(bot),
    dispatch: mockDispatch(),
    sourceFbosConfig: x => ({
      value: bot.hardware.configuration[x], consistent: true,
    }),
    botOnline: false,
    device: fakeDevice(),
    timeSettings: fakeTimeSettings(),
    showAdvanced: true,
  });

  it("renders", () => {
    const { container } = render(<FarmbotOsRow {...fakeProps()} />);
    ["Farmbot OS", "Version", "Release Notes"].map(string =>
      expect(container).toContainHTML(string));
  });

  it("fetches API OS release info", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.target = "rpi";
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    render(<FarmbotOsRow {...p} />);
    expect(fetchOsUpdateVersion).toHaveBeenCalledWith("rpi");
    expect(fetchOsUpdateVersion).toHaveBeenCalledTimes(1);
  });

  it("fetches API OS release info when bot version changes", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.target = "rpi";
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    const { rerender } = render(<FarmbotOsRow {...p} />);
    expect(fetchOsUpdateVersion).toHaveBeenCalledTimes(1);
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    rerender(<FarmbotOsRow {...p} />);
    expect(fetchOsUpdateVersion).toHaveBeenCalledTimes(1);
    p.bot.hardware.informational_settings.controller_version = "2.0.0";
    rerender(<FarmbotOsRow {...p} />);
    expect(fetchOsUpdateVersion).toHaveBeenCalledTimes(2);
  });

  it("uses controller version", () => {
    const p = fakeProps();
    p.bot.osReleaseNotes = "intro\n\n# v1\n\n* note";
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    p.device.body.fbos_version = "2.0.0";
    render(<FarmbotOsRow {...p} />);
    const button = screen.getByText("Release Notes");
    fireEvent.click(button);
    expect(screen.getByText("FarmBot OS v1")).toBeInTheDocument();
  });

  it("uses fbos version", () => {
    const p = fakeProps();
    p.bot.osReleaseNotes = "intro\n\n# v2\n\n* note";
    p.bot.hardware.informational_settings.controller_version = undefined;
    p.device.body.fbos_version = "2.0.0";
    render(<FarmbotOsRow {...p} />);
    const button = screen.getByText("Release Notes");
    fireEvent.click(button);
    expect(screen.getByText("FarmBot OS v2")).toBeInTheDocument();
  });
});

describe("getOsReleaseNotesForVersion()", () => {
  it("fetches OS release notes", () => {
    const mockData = "intro\n\n# v10\n\n* note 10";
    const result = getOsReleaseNotesForVersion(mockData, "10.0.0");
    expect(result.heading).toEqual("FarmBot OS v10");
    expect(result.notes).toEqual("* note 10");
  });

  it("falls back to recent OS version", () => {
    const mockData = "intro\n\n# v11\n\n* note 11";
    const result = getOsReleaseNotesForVersion(mockData, undefined);
    expect(result.heading).toEqual("FarmBot OS v11");
    expect(result.notes).toEqual("* note 11");
  });

  it("falls back to known OS release note", () => {
    const mockData = "intro\n\n# v11\n\n* note 11\n\n# v13\n\n* note 13";
    const result = getOsReleaseNotesForVersion(mockData, "12.0.0");
    expect(result.heading).toEqual("FarmBot OS v12");
    expect(result.notes).toEqual("* note 11\n");
  });

  it("falls back to latest OS release note", () => {
    const mockData = "intro\n\n# v10\n\n* note 10";
    const result = getOsReleaseNotesForVersion(mockData, "12.0.0");
    expect(result.heading).toEqual("FarmBot OS v12");
    expect(result.notes).toEqual("* note 10");
  });

  it("fails to fetch OS release notes", () => {
    const mockData = undefined;
    const result = getOsReleaseNotesForVersion(mockData, "10.0.0");
    expect(result.heading).toEqual("FarmBot OS v10");
    expect(result.notes).toEqual("Could not get release notes.");
  });
});
