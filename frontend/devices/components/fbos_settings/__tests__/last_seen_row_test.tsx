jest.mock("../../../../api/crud", () => ({ refresh: jest.fn() }));

import * as React from "react";
import { fakeResource } from "../../../../__test_support__/fake_resource";
import { LastSeen, LastSeenProps } from "../last_seen_row";
import { mount } from "enzyme";
import { SpecialStatus, TaggedDevice } from "farmbot";
import { fakeTimeSettings } from "../../../../__test_support__/fake_time_settings";
import { refresh } from "../../../../api/crud";

describe("<LastSeen />", () => {
  const resource = (): TaggedDevice => fakeResource("Device", {
    id: 1,
    name: "foo",
    last_saw_api: "",
    tz_offset_hrs: 0
  });

  const props = (): LastSeenProps => ({
    device: resource(),
    botToMqttLastSeen: 0,
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("blinks when loading", () => {
    const p = props();
    p.device.specialStatus = SpecialStatus.SAVING;
    const wrapper = mount(<LastSeen {...p} />);
    expect(wrapper.text()).toContain("Loading");
  });

  it("tells you the device has never been seen", () => {
    const wrapper = mount(<LastSeen {...props()} />);
    expect(wrapper.text()).toContain("network connectivity issue");
  });

  it("tells you when the device was last seen, no MQTT", () => {
    const p = props();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = 0;
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual("2017-08-07T19:40:01.487Z");
  });

  it("tells you when the device was last seen, latest: API", () => {
    const p = props();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = new Date("2016-08-07T19:40:01.487Z").getTime();
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual("2017-08-07T19:40:01.487Z");
  });

  it("tells you when the device was last seen, latest: message broker", () => {
    const p = props();
    p.device.body.last_saw_api = "2017-08-07T19:40:01.487Z";
    p.botToMqttLastSeen = new Date("2017-08-07T20:40:01.487Z").getTime();
    const wrapper = mount<LastSeen>(<LastSeen {...p} />);
    expect(wrapper.instance().lastSeen).toEqual("2017-08-07T20:40:01.487Z");
  });

  it("handles a click", () => {
    const p = props();
    const wrapper = mount(<LastSeen {...p} />);
    wrapper.find("i").simulate("click");
    expect(refresh).toHaveBeenCalled();
  });
});
