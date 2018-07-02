import * as React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { Show, IndexIndicator } from "../show";
import { props } from "../test_helpers";

describe("<Show/>", () => {
  it("Renders feed title", () => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    const p = props([feed1, feed2]);
    const el = mount<{}>(<Show {...p} />);
    expect(el.text()).toContain(feed1.body.name);
    el.find(".image-flipper-right").first().simulate("click");
    el.render();
    expect(el.text()).toContain(feed2.body.name);
  });
});

describe("<IndexIndicator/>", () => {
  it("renders index indicator: position 1", () => {
    const wrapper = mount<{}>(<IndexIndicator i={0} total={2} />);
    expect(wrapper.find("div").props().style)
      .toEqual({ left: "calc(-10px + 0 * 50%)", width: "50%" });
  });

  it("renders index indicator: position 2", () => {
    const wrapper = mount<{}>(<IndexIndicator i={1} total={4} />);
    expect(wrapper.find("div").props().style)
      .toEqual({ left: "calc(-10px + 1 * 25%)", width: "25%" });
  });

  it("doesn't render index indicator", () => {
    const wrapper = mount<{}>(<IndexIndicator i={0} total={1} />);
    expect(wrapper.html()).toEqual("<div></div>");
  });
});
