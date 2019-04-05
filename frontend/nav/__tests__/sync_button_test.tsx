import * as React from "react";
import { SyncButton } from "../sync_button";
import { bot } from "../../__test_support__/fake_state/bot";
import { shallow } from "enzyme";
import { SyncButtonProps } from "../interfaces";

describe("<SyncButton/>", function () {
  const fakeProps = (): SyncButtonProps => {
    return {
      dispatch: jest.fn(),
      bot: bot,
      consistent: true,
    };
  };

  it("is gray when inconsistent", () => {
    const p = fakeProps();
    p.consistent = false;
    p.bot.hardware.informational_settings.sync_status = "sync_now";
    const result = shallow(<SyncButton {...p} />);
    expect(result.hasClass("gray")).toBeTruthy();
  });

  it("is not gray when disconnected", () => {
    const p = fakeProps();
    p.consistent = false;
    p.bot.hardware.informational_settings.sync_status = "unknown";
    const result = shallow(<SyncButton {...p} />);
    expect(result.hasClass("gray")).toBeFalsy();
  });

  it("defaults to `disconnected` and `red` when uncertain", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.bot.hardware.informational_settings.sync_status = "new" as any;
    const result = shallow(<SyncButton {...p} />);
    expect(result.text()).toContain("new");
    expect(result.hasClass("red")).toBeTruthy();
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
});
