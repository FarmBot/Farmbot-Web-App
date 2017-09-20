import * as React from "react";
import { WebcamPanelProps } from "../interfaces";
import { TaggedWebcamFeed } from "../../../resources/tagged_resources";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { Show } from "../show";

describe("<Show/>", () => {
  const props = (feeds: TaggedWebcamFeed[]): WebcamPanelProps => {
    return {
      onToggle: jest.fn(),
      feeds,
      init: jest.fn(),
      edit: jest.fn(),
      save: jest.fn(),
      destroy: jest.fn(),
    };
  };

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
