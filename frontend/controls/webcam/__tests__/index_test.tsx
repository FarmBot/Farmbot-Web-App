jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
  save: jest.fn(),
  init: jest.fn(),
  edit: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { WebcamPanel, preToggleCleanup } from "../index";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { destroy, save, init, edit } from "../../../api/crud";
import { SpecialStatus } from "farmbot";
import { clickButton, allButtonText } from "../../../__test_support__/helpers";

describe("<WebcamPanel />", () => {
  const fakeProps = () => ({
    feeds: [],
    dispatch: jest.fn(),
  });

  it("toggles form state to edit", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    expect(wrapper.instance().state.activeMenu).toEqual("show");
    const text = allButtonText(wrapper);
    expect(text.toLowerCase()).not.toContain("view");
    clickButton(wrapper, 0, "edit");
    expect(wrapper.instance().state.activeMenu).toEqual("edit");
  });

  it("toggles form state to view", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    wrapper.setState({ activeMenu: "edit" });
    const text = allButtonText(wrapper);
    expect(text.toLowerCase()).not.toContain("edit");
    clickButton(wrapper, 0, "back");
    expect(wrapper.instance().state.activeMenu).toEqual("show");
  });

  it("calls init", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    wrapper.instance().init();
    expect(init).toHaveBeenCalledWith("WebcamFeed", { name: "", url: "http://" });
  });

  it("calls edit", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    wrapper.instance().edit(feed, {});
    expect(edit).toHaveBeenCalledWith(feed, {});
  });

  it("calls save", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    wrapper.instance().save(feed);
    expect(save).toHaveBeenCalledWith(feed.uuid);
  });

  it("doesn't call save", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    feed.body.url = "http://";
    wrapper.instance().save(feed);
    expect(save).not.toHaveBeenCalled();
  });

  it("calls destroy", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    wrapper.instance().destroy(feed);
    expect(destroy).toHaveBeenCalledWith(feed.uuid);
  });
});

describe("preToggleCleanup", () => {
  it("deletes empty or unsaved records", () => {
    const dispatch = jest.fn();
    const feed = fakeWebcamFeed();
    feed.body.id = undefined;
    const { uuid } = feed;
    preToggleCleanup(dispatch)(feed);
    expect(dispatch).toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledWith(uuid, true);
  });

  it("stashes unsaved to preexisting records", () => {
    const dispatch = jest.fn();
    const feed = fakeWebcamFeed();
    feed.body.id = 9;
    feed.specialStatus = SpecialStatus.DIRTY;
    const { uuid } = feed;
    preToggleCleanup(dispatch)(feed);
    expect(dispatch).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(uuid);
  });
});
