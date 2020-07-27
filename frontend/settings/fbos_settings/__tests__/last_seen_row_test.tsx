jest.mock("../../../api/crud", () => ({ refresh: jest.fn() }));

import * as React from "react";
import { LastSeen, LastSeenProps, getLastSeenNumber } from "../last_seen_row";
import { mount } from "enzyme";
import { SpecialStatus } from "farmbot";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { refresh } from "../../../api/crud";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("<LastSeen />", () => {
  const fakeProps = (): LastSeenProps => ({
    device: fakeDevice(),
    botToMqttLastSeen: 0,
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
    const wrapper = mount(<LastSeen {...fakeProps()} />);
    expect(wrapper.text()).toContain("network connectivity issue");
  });

  it("tells you when the device was last seen, no MQTT", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = 0;
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual(p.device.body.last_saw_api);
  });

  it("tells you when the device was last seen, latest: API", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = new Date("2016-08-07T19:40:01.487Z").getTime();
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual(p.device.body.last_saw_api);
  });

  it("tells you when the device was last seen, latest: message broker", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = new Date("2017-08-07T20:40:01.487Z").getTime();
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual(p.botToMqttLastSeen);
  });

  it("tells you when the device was last seen, same", () => {
    const p = fakeProps();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = new Date("2017-08-07T19:40:01.487Z").getTime();
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual(p.botToMqttLastSeen);
  });

  it("handles a click", () => {
    const p = fakeProps();
    const wrapper = mount(<LastSeen {...p} />);
    wrapper.find("i").simulate("click");
    expect(refresh).toHaveBeenCalled();
  });
});

describe("getLastSeenNumber()", () => {
  it("returns number: unknown", () => {
    const result = getLastSeenNumber(bot);
    expect(result).toEqual(NaN);
  });

  it("returns number: known", () => {
    bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 0 };
    const result = getLastSeenNumber(bot);
    expect(result).toEqual(0);
  });
});
