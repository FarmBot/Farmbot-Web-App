import React from "react";
import { mount } from "enzyme";
import { WebcamPanel, preToggleCleanup } from "../index";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import * as crud from "../../../api/crud";
import { SpecialStatus } from "farmbot";
import { clickButton, allButtonText } from "../../../__test_support__/helpers";

let initSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  initSpy = jest.spyOn(crud, "init").mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
});

afterEach(() => {
  initSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  destroySpy.mockRestore();
});

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
    expect(initSpy).toHaveBeenCalledWith("WebcamFeed", { name: "", url: "http://" });
  });

  it("calls edit", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    wrapper.instance().edit(feed, {});
    expect(editSpy).toHaveBeenCalledWith(feed, {});
  });

  it("calls save", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    wrapper.instance().save(feed);
    expect(saveSpy).toHaveBeenCalledWith(feed.uuid);
  });

  it("doesn't call save", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    feed.body.url = "http://";
    wrapper.instance().save(feed);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("calls destroy", () => {
    const wrapper = mount<WebcamPanel>(<WebcamPanel {...fakeProps()} />);
    const feed = fakeWebcamFeed();
    wrapper.instance().destroy(feed);
    expect(destroySpy).toHaveBeenCalledWith(feed.uuid);
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
    expect(destroySpy).toHaveBeenCalledWith(uuid, true);
  });

  it("stashes unsaved to preexisting records", () => {
    const dispatch = jest.fn();
    const feed = fakeWebcamFeed();
    feed.body.id = 9;
    feed.specialStatus = SpecialStatus.DIRTY;
    const { uuid } = feed;
    preToggleCleanup(dispatch)(feed);
    expect(dispatch).toHaveBeenCalled();
    expect(saveSpy).toHaveBeenCalledWith(uuid);
  });
});
