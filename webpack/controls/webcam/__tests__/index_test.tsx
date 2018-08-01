jest.mock("../../../api/crud", () => {
  return { destroy: jest.fn(), save: jest.fn() };
});

import * as React from "react";
import { mount } from "enzyme";
import { WebcamPanel, preToggleCleanup } from "../index";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { destroy, save } from "../../../api/crud";
import { SpecialStatus } from "farmbot";
import { clickButton, allButtonText } from "../../../__test_support__/helpers";

describe("<WebcamPanel/>", () => {
  it("toggles form state to edit", () => {
    const props = { feeds: [], dispatch: jest.fn() };
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...props} />);
    expect(wrapper.instance().state.activeMenu).toEqual("show");
    const text = allButtonText(wrapper);
    expect(text.toLowerCase()).not.toContain("view");
    clickButton(wrapper, 0, "edit");
    expect(wrapper.instance().state.activeMenu).toEqual("edit");
  });

  it("toggles form state to view", () => {
    const props = { feeds: [], dispatch: jest.fn() };
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...props} />);
    wrapper.setState({ activeMenu: "edit" });
    const text = allButtonText(wrapper);
    expect(text.toLowerCase()).not.toContain("edit");
    clickButton(wrapper, 2, "view");
    expect(wrapper.instance().state.activeMenu).toEqual("show");
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
