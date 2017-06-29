jest.unmock("../../../api/crud");
import * as React from "react";
import { mount } from "enzyme";
import { CopyButton } from "../copy_button";
import { TaggedRegimen } from "../../../resources/tagged_resources";

describe("Copy button", () => {
  function fakeRegimen(): TaggedRegimen {
    return {
      uuid: "Whatever",
      kind: "regimens",
      body: {
        name: "Foo",
        color: "red",
        regimen_items: []
      }
    };
  }
  it("Initializes a new regimen on click", () => {
    let dispatch = jest.fn();
    let regimen = fakeRegimen();
    let el = mount(<CopyButton dispatch={dispatch} regimen={regimen} />);
    expect(el.find("button").length).toBe(1);
    el.simulate("click");
    expect(dispatch.mock.calls.length).toBe(1);
    let action = dispatch.mock.calls[0][0];
    expect(typeof action).toEqual("object");
    expect(action.type).toEqual("INIT_RESOURCE");
    let reg = action.payload.body;
    expect(action.payload.dirty).toBeTruthy();
    expect(reg.name).toContain("Foo copy");
  });

  it("Render a button when given a regimen", () => {
    let dispatch = jest.fn();
    let regimen = fakeRegimen();
    let el = mount(<CopyButton dispatch={dispatch} regimen={regimen} />);
    expect(el.find("button").length).toBe(1);
    el.simulate("click");
    expect(dispatch.mock.calls.length).toBe(1);
  });

  it("renders nothing if not given a regimen", () => {
    let dispatch = jest.fn();
    let el = mount(<CopyButton dispatch={dispatch} />);
    expect(el.find("button").length).toBe(0);
    el.simulate("click");
    expect(dispatch.mock.calls.length).toBe(0);
  });

});
