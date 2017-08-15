import * as React from "react";
import { fakeResource } from "../../../__test_support__/fake_resource";
import { LastSeen } from "../last_seen_widget";
import { mount } from "enzyme";
import { SpecialStatus } from "../../../resources/tagged_resources";
describe("<LastSeen/>", () => {
  let resource = () => fakeResource("device", {
    id: 1,
    name: "foo",
    last_seen: ""
  });
  it("blinks when loading", () => {
    let r = resource();
    r.specialStatus = SpecialStatus.SAVING;
    let cb = jest.fn();
    let el = mount(<LastSeen device={r} onClick={cb} />);
    expect(el.text()).toContain("Loading");
  });

  it("tells you the device has never been seen", () => {
    let r = resource();
    let cb = jest.fn();
    let el = mount(<LastSeen device={r} onClick={cb} />);
    expect(el.text()).toContain("network connectivity issue");
  });

  it("tells you when the device was last seen", () => {
    let r = resource();
    let cb = jest.fn();
    r.body.last_seen = "2017-08-07T19:40:01.487Z";
    let el = mount(<LastSeen device={r} onClick={cb} />);
    expect(el.text()).toContain("FarmBot was last seen");
  });

  it("handles a click");
});
