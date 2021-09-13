jest.mock("../../../api/crud", () => ({ refresh: jest.fn() }));

import React from "react";
import {
  LastSeen, lastSeenNumber, LastSeenNumberProps, LastSeenProps,
} from "../last_seen_row";
import { mount } from "enzyme";
import { SpecialStatus } from "farmbot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { refresh } from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { cloneDeep } from "lodash";

describe("<LastSeen />", () => {
  const fakeProps = (): LastSeenProps => ({
    device: fakeDevice(),
    bot: cloneDeep(bot),
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("blinks when loading", () => {
    const p = fakeProps();
    p.device.specialStatus = SpecialStatus.SAVING;
    const wrapper = mount(<LastSeen {...p} />);
    expect(wrapper.text()).toContain("Loading");
  });

  it("tells you the device has never been seen", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = undefined;
    p.bot.connectivity.uptime["bot.mqtt"] = undefined;
    const wrapper = mount(<LastSeen {...p} />);
    expect(wrapper.text()).toContain("network connectivity issue");
  });

  it("tells you when the device was last seen", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.bot.connectivity.uptime["bot.mqtt"] = undefined;
    const wrapper = mount(<LastSeen {...p} />);
    expect(wrapper.text().toLowerCase())
      .toEqual("farmbot was last seen august 7, 2017 7:40pm");
  });

  it("handles a click", () => {
    const p = fakeProps();
    const wrapper = mount(<LastSeen {...p} />);
    wrapper.find("i").simulate("click");
    expect(refresh).toHaveBeenCalled();
  });
});

describe("lastSeenNumber()", () => {
  const fakeProps = (): LastSeenNumberProps => ({
    device: fakeDevice(),
    bot: cloneDeep(bot),
  });

  it("returns number: unknown", () => {
    expect(lastSeenNumber(fakeProps())).toEqual(NaN);
  });

  it("returns number: known", () => {
    const p = fakeProps();
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 0 };
    expect(lastSeenNumber(p)).toEqual(0);
  });

  it("tells you when the device was last seen, no MQTT", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 0 };
    const expected = new Date(p.device.body.last_saw_api).getTime();
    expect(lastSeenNumber(p)).toEqual(expected);
  });

  it("tells you when the device was last seen, latest: API", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    const at = new Date("2016-08-07T19:40:01.487Z").getTime();
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at };
    const expected = new Date(p.device.body.last_saw_api).getTime();
    expect(lastSeenNumber(p)).toEqual(expected);
  });

  it("tells you when the device was last seen, latest: message broker", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    const at = new Date("2017-08-07T20:40:01.487Z").getTime();
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at };
    expect(lastSeenNumber(p)).toEqual(at);
  });

  it("tells you when the device was last seen, same", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    const at = new Date("2017-08-07T19:40:01.487Z").getTime();
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at };
    expect(lastSeenNumber(p)).toEqual(at);
  });
});
