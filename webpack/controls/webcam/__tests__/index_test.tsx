jest.mock("../../../api/crud", () => {
  return { destroy: jest.fn(), save: jest.fn() };
});

import * as React from "react";
import { mount } from "enzyme";
import { WebcamPanel, preToggleCleanup } from "../index";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import { destroy, save } from "../../../api/crud";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<WebcamPanel/>", () => {
  it("toggles form states", () => {
    const props = { feeds: [], dispatch: jest.fn() };
    const el = mount(<WebcamPanel {...props} />);
    expect(el.text()).toContain("edit");
    el.find("button").first().simulate("click");
    el.update();
    expect(el.text()).toContain("view");
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
