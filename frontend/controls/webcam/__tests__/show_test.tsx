import * as React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { Show, IndexIndicator } from "../show";
import { props } from "../test_helpers";
import { PLACEHOLDER_FARMBOT } from "../../../farmware/images/image_flipper";

describe("<Show/>", () => {
  const feed1 = fakeWebcamFeed();
  const feed2 = fakeWebcamFeed();
  const p = props([feed1, feed2]);

  it("Renders feed title", () => {
    const el = mount(<Show {...p} />);
    expect(el.text()).toContain(feed1.body.name);
    el.find(".image-flipper-right").first().simulate("click");
    el.render();
    expect(el.text()).toContain(feed2.body.name);
  });

  it("returns a PLACEHOLDER_FEED", () => {
    const comp = new Show(p);
    const result = comp.getMessage("http://geocities.com/" + PLACEHOLDER_FARMBOT);
    expect(result).toEqual("Click the edit button to add or edit a feed URL.");
  });
});

describe("<IndexIndicator/>", () => {
  it("renders index indicator: position 1", () => {
    const wrapper = mount(<IndexIndicator i={0} total={2} />);
    expect(wrapper.find("div").props().style)
      .toEqual({ left: "calc(-10px + 0 * 50%)", width: "50%" });
  });

  it("renders index indicator: position 2", () => {
    const wrapper = mount(<IndexIndicator i={1} total={4} />);
    expect(wrapper.find("div").props().style)
      .toEqual({ left: "calc(-10px + 1 * 25%)", width: "25%" });
  });

  it("doesn't render index indicator", () => {
    const wrapper = mount(<IndexIndicator i={0} total={1} />);
    expect(wrapper.html()).toEqual("<div class=\"no-index-indicator\"></div>");
  });
});
