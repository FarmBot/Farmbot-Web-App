const mockPush = jest.fn();
jest.mock("../../../history", () => ({
  push: (url: string) => mockPush(url)
}));

jest.unmock("../../../api/crud");
import * as React from "react";
import { mount } from "enzyme";
import { CopyButton } from "../copy_button";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("Copy button", () => {

  it("Initializes a new regimen on click", () => {
    const dispatch = jest.fn();
    const regimen = fakeRegimen();
    const el = mount(<CopyButton dispatch={dispatch} regimen={regimen} />);
    expect(el.find("button").length).toBe(1);
    el.simulate("click");
    expect(dispatch.mock.calls.length).toBe(1);
    const action = dispatch.mock.calls[0][0];
    expect(typeof action).toEqual("object");
    expect(action.type).toEqual("INIT_RESOURCE");
    const reg = action.payload.body;
    expect(action.payload.specialStatus).toBe(SpecialStatus.DIRTY);
    expect(reg.name).toContain("Foo copy");
    expect(mockPush).toHaveBeenCalledWith("/app/regimens/foo_copy_1");
  });

  it("Render a button when given a regimen", () => {
    const dispatch = jest.fn();
    const regimen = fakeRegimen();
    const el = mount(<CopyButton dispatch={dispatch} regimen={regimen} />);
    expect(el.find("button").length).toBe(1);
    el.simulate("click");
    expect(dispatch.mock.calls.length).toBe(1);
  });

  it("renders nothing if not given a regimen", () => {
    const dispatch = jest.fn();
    const el = mount(<CopyButton dispatch={dispatch} />);
    expect(el.find("button").length).toBe(0);
    el.simulate("click");
    expect(dispatch.mock.calls.length).toBe(0);
  });

});
