import React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { Show, IndexIndicator } from "../show";
import { PLACEHOLDER_FARMBOT } from "../../../photos/images/image_flipper";
import { WebcamPanelProps } from "../interfaces";
import { SpecialStatus } from "farmbot";

describe("<Show />", () => {
  const fakeProps = (): WebcamPanelProps => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    feed1.specialStatus = SpecialStatus.DIRTY;
    return {
      onToggle: jest.fn(),
      feeds: [feed1, feed2],
      init: jest.fn(),
      edit: jest.fn(),
      save: jest.fn(),
      destroy: jest.fn(),
    };
  };

  it("renders feed title", () => {
    const p = fakeProps();
    const wrapper = mount(<Show {...p} />);
    expect(wrapper.text()).toContain(p.feeds[0].body.name);
    expect(p.feeds[0].body.name).not.toEqual(p.feeds[1].body.name);
  });

  it.each<[string, string, number, number]>([
    [".image-flipper-right", "Next", 0, 1],
    [".image-flipper-left", "Prev", 1, 0],
  ])("navigates %s: %s", (className, btnText, from, to) => {
    const p = fakeProps();
    const wrapper = mount<Show>(<Show {...p} />);
    wrapper.setState({ current: from });
    expect(wrapper.text()).toContain(p.feeds[from].body.name);
    const prev = wrapper.find(className);
    expect(prev.text()).toEqual(btnText);
    prev.simulate("click");
    expect(wrapper.state().current).toEqual(to);
    expect(wrapper.text()).toContain(p.feeds[to].body.name);
  });

  it("returns a PLACEHOLDER_FEED", () => {
    const comp = new Show(fakeProps());
    const result = comp.getMessage("http://geocities.com/" + PLACEHOLDER_FARMBOT);
    expect(result).toEqual("Click the edit button to add or edit a feed URL.");
  });
});

describe("<IndexIndicator/>", () => {
  it("renders index indicator: position 1", () => {
    const wrapper = mount(<IndexIndicator i={0} total={2} />);
    expect(wrapper.find("div").props().style)
      .toEqual({ left: "calc(0 * 50%)", width: "50%" });
  });

  it("renders index indicator: position 2", () => {
    const wrapper = mount(<IndexIndicator i={1} total={4} />);
    expect(wrapper.find("div").props().style)
      .toEqual({ left: "calc(1 * 25%)", width: "25%" });
  });

  it("doesn't render index indicator", () => {
    const wrapper = mount(<IndexIndicator i={0} total={1} />);
    expect(wrapper.html()).toEqual("<div class=\"no-index-indicator\"></div>");
  });
});
