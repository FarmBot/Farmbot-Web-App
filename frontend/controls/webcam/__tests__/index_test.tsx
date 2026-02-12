import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { WebcamPanel, preToggleCleanup } from "../index";
import { fakeWebcamFeed } from "../../../__test_support__/fake_state/resources";
import * as crud from "../../../api/crud";
import { SpecialStatus } from "farmbot";

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
    const { container } = render(<WebcamPanel {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).not.toContain("view");
    const editButton = container.querySelector("button[title='Edit']");
    editButton && fireEvent.click(editButton);
    expect(container.querySelector("button[title='Back']")).toBeTruthy();
  });

  it("toggles form state to view", () => {
    const { container } = render(<WebcamPanel {...fakeProps()} />);
    const editButton = container.querySelector("button[title='Edit']");
    editButton && fireEvent.click(editButton);
    expect(container.textContent?.toLowerCase()).not.toContain("edit");
    const backButton = container.querySelector("button[title='Back']");
    backButton && fireEvent.click(backButton);
    expect(container.querySelector("button[title='Edit']")).toBeTruthy();
  });

  it("calls init", () => {
    const ref = React.createRef<WebcamPanel>();
    render(<WebcamPanel {...fakeProps()} ref={ref} />);
    ref.current?.init();
    expect(initSpy).toHaveBeenCalledWith("WebcamFeed", { name: "", url: "http://" });
  });

  it("calls edit", () => {
    const ref = React.createRef<WebcamPanel>();
    render(<WebcamPanel {...fakeProps()} ref={ref} />);
    const feed = fakeWebcamFeed();
    ref.current?.edit(feed, {});
    expect(editSpy).toHaveBeenCalledWith(feed, {});
  });

  it("calls save", () => {
    const ref = React.createRef<WebcamPanel>();
    render(<WebcamPanel {...fakeProps()} ref={ref} />);
    const feed = fakeWebcamFeed();
    ref.current?.save(feed);
    expect(saveSpy).toHaveBeenCalledWith(feed.uuid);
  });

  it("doesn't call save", () => {
    const ref = React.createRef<WebcamPanel>();
    render(<WebcamPanel {...fakeProps()} ref={ref} />);
    const feed = fakeWebcamFeed();
    feed.body.url = "http://";
    ref.current?.save(feed);
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it("calls destroy", () => {
    const ref = React.createRef<WebcamPanel>();
    render(<WebcamPanel {...fakeProps()} ref={ref} />);
    const feed = fakeWebcamFeed();
    ref.current?.destroy(feed);
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
