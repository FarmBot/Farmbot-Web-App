import * as React from "react";
import { TestButton, TestBtnProps } from "../test_button";
import { TaggedSequence } from "../../resources/tagged_resources";
import { mount } from "enzyme";

describe("<TestButton/>", () => {
  function fakeSequence(): TaggedSequence {
    return {
      "kind": "sequences",
      "body": {
        "name": "Goto 0, 0, 0",
        "color": "gray",
        "body": [],
        "args": { "version": 4 },
        "kind": "sequence"
      },
      "uuid": "sequences.23.47"
    };
  }

  function fakeProps(): TestBtnProps {
    jest.clearAllMocks();
    return {
      onClick: jest.fn(),
      onFail: jest.fn(),
      sequence: fakeSequence(),
      syncStatus: "synced"
    };
  }

  it("doesnt fire if unsaved", () => {
    let props = fakeProps();
    props.sequence.dirty = true;
    let result = mount(<TestButton {...props} />);
    let btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("gray")).toBeTruthy();
    expect(props.onFail).toHaveBeenCalled();
    expect(props.onClick).not.toHaveBeenCalled();
  });

  it("doesnt fire if unsynced", () => {
    let props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.dirty = false;
    props.sequence.body.id = 1;
    let result = mount(<TestButton {...props} />);
    let btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("gray")).toBeTruthy();
    expect(props.onFail).toHaveBeenCalled();
    expect(props.onClick).not.toHaveBeenCalled();
  });

  it("does fire if saved and synced", () => {
    let props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.dirty = false;
    props.sequence.body.id = 1;
    let result = mount(<TestButton {...props} />);
    let btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("orange")).toBeTruthy();
    expect(props.onFail).not.toHaveBeenCalled();
    expect(props.onClick).toHaveBeenCalled();
  });
});
