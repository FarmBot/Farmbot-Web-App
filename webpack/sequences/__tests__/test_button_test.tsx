import * as React from "react";
import { TestButton, TestBtnProps } from "../test_button";
import { TaggedSequence, SpecialStatus } from "farmbot";
import { mount } from "enzyme";

describe("<TestButton/>", () => {
  function fakeSequence(): TaggedSequence {
    return {
      "kind": "Sequence",
      "specialStatus": SpecialStatus.SAVED,
      "body": {
        "name": "Goto 0, 0, 0",
        "color": "gray",
        "body": [],
        "args": {
          "version": 4,
          "locals": { kind: "scope_declaration", args: {} },
        },
        "kind": "sequence"
      },
      "uuid": "Sequence.23.47"
    };
  }

  function fakeProps(): TestBtnProps {
    return {
      onClick: jest.fn(),
      onFail: jest.fn(),
      sequence: fakeSequence(),
      syncStatus: "synced"
    };
  }

  it("doesn't fire if unsaved", () => {
    const props = fakeProps();
    props.sequence.specialStatus = SpecialStatus.DIRTY;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("pseudo-disabled")).toBeTruthy();
    expect(props.onFail).toHaveBeenCalled();
    expect(props.onClick).not.toHaveBeenCalled();
  });

  it("doesn't fire if unsynced", () => {
    const props = fakeProps();
    props.syncStatus = "sync_now";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("pseudo-disabled")).toBeTruthy();
    expect(props.onFail).toHaveBeenCalled();
    expect(props.onClick).not.toHaveBeenCalled();
  });

  it("does fire if saved and synced", () => {
    const props = fakeProps();
    props.syncStatus = "synced";
    props.sequence.specialStatus = SpecialStatus.SAVED;
    props.sequence.body.id = 1;
    const result = mount(<TestButton {...props} />);
    const btn = result.find("button");
    btn.simulate("click");
    expect(btn.hasClass("orange")).toBeTruthy();
    expect(props.onFail).not.toHaveBeenCalled();
    expect(props.onClick).toHaveBeenCalled();
  });
});
