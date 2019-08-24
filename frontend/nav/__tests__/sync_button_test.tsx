import * as React from "react";
import { SyncButton } from "../sync_button";
import { bot } from "../../__test_support__/fake_state/bot";
import { shallow } from "enzyme";
import { SyncButtonProps } from "../interfaces";
import { SyncStatus } from "farmbot";

describe("<SyncButton/>", function () {
  const fakeProps = (): SyncButtonProps => ({
    dispatch: jest.fn(),
    bot: bot,
    consistent: true,
    autoSync: false,
  });

  it("is gray when inconsistent", () => {
    const p = fakeProps();
    p.consistent = false;
    p.bot.hardware.informational_settings.sync_status = "sync_now";
    const result = shallow(<SyncButton {...p} />);
    expect(result.hasClass("pseudo-disabled")).toBeTruthy();
  });

  it("is gray when disconnected", () => {
    const p = fakeProps();
    p.consistent = false;
    p.bot.hardware.informational_settings.sync_status = "unknown";
    const result = shallow(<SyncButton {...p} />);
    expect(result.hasClass("pseudo-disabled")).toBeTruthy();
  });

  it("defaults to `unknown` and gray when uncertain", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.bot.hardware.informational_settings.sync_status = "new" as any;
    const result = shallow(<SyncButton {...p} />);
    expect(result.text()).toContain("new");
    expect(result.hasClass("pseudo-disabled")).toBeTruthy();
  });

  it("syncs when clicked", () => {
    const p = fakeProps();
    const result = shallow(<SyncButton {...p} />);
    result.find("button").simulate("click");
    expect(p.dispatch).toHaveBeenCalled();
  });

  it("doesn't show spinner when not syncing", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "sync_now";
    const result = shallow(<SyncButton {...p} />);
    expect(result.find(".btn-spinner").length).toEqual(0);
  });

  it("shows spinner when syncing", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "syncing";
    const result = shallow(<SyncButton {...p} />);
    expect(result.find(".btn-spinner").length).toEqual(1);
  });

  it("standart font when synced (autosync)", () => {
    const p = fakeProps();
    p.autoSync = true;
    p.bot.hardware.informational_settings.sync_status = "synced";
    const result = shallow(<SyncButton {...p} />);
    expect(result.find(".auto-sync").length).toEqual(1);
  });

  it("italicized font when syncing (autosync)", () => {
    const p = fakeProps();
    p.autoSync = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    const result = shallow(<SyncButton {...p} />);
    expect(result.find(".auto-sync-busy").length).toEqual(1);
  });

  const testCase = (input: SyncStatus, expected: string) => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = input;
    p.autoSync = true;
    const result = shallow(<SyncButton {...p} />);
    expect(result.text()).toContain(expected);
  };

  it("renders differently with auto-sync enabled", () => {
    testCase("syncing", "Syncing...");
    testCase("sync_now", "Syncing...");
    testCase("synced", "Synced");
    testCase("booting", "Sync unknown");
    testCase("unknown", "Sync unknown");
    testCase("maintenance", "Sync unknown");
    testCase("sync_error", "Sync error");
  });
});
