import * as React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { Show } from "../show";
import { props } from "../test_helpers";

describe("<Show/>", () => {
  it("Renders feed title", () => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    const p = props([feed1, feed2]);
    const el = mount(<Show {...p} />);
    expect(el.text()).toContain(feed1.body.name);
    el.find(".image-flipper-right").first().simulate("click");
    el.render();
    expect(el.text()).toContain(feed2.body.name);
  });
});
