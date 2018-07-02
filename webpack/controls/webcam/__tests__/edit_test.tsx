import * as React from "react";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { mount } from "enzyme";
import { props } from "../test_helpers";
import { Edit } from "../edit";
import { SpecialStatus } from "../../../resources/tagged_resources";
import { clickButton } from "../../../__test_support__/helpers";
import { WebcamPanelProps } from "../interfaces";

describe("<Edit/>", () => {
  const fakeProps = (): WebcamPanelProps => {
    const feed1 = fakeWebcamFeed();
    const feed2 = fakeWebcamFeed();
    feed1.specialStatus = SpecialStatus.DIRTY;
    return props([feed1, feed2]);
  };

  it("renders the list of feeds", () => {
    const p = fakeProps();
    const wrapper =mount<>(<Edit {...p} />);
    [
      p.feeds[0].body.name,
      p.feeds[0].body.url,
      p.feeds[1].body.name,
      p.feeds[1].body.url
    ].map(text =>
      expect(wrapper.html()).toContain(text));
  });

  it("saves feeds", () => {
    const p = fakeProps();
    const wrapper =mount<>(<Edit {...p} />);
    clickButton(wrapper, 1, "save*");
    expect(p.save).toHaveBeenCalledWith(p.feeds[0]);
  });

  it("shows feeds as saved", () => {
    const p = fakeProps();
    p.feeds[0].specialStatus = SpecialStatus.SAVED;
    p.feeds[1].specialStatus = SpecialStatus.SAVED;
    const wrapper =mount<>(<Edit {...p} />);
    expect(wrapper.find("button").at(1).text()).toEqual("Save");
  });
});
