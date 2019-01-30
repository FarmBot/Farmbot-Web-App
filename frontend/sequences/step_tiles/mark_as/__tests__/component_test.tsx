jest.mock("../commit_step_changes", () => {
  return {
    commitStepChanges: jest.fn()
  };
});
import * as React from "react";
import { shallow, mount } from "enzyme";
import { MarkAs } from "../../mark_as";
import { FBSelect } from "../../../../ui";
import { fakeMarkAsProps } from "../assertion_support";
import { commitStepChanges } from "../commit_step_changes";

describe("<MarkAs/>", () => {
  it("renders the basic parts", () => {
    const el = mount(<MarkAs {...fakeMarkAsProps()} />);
    const text = el.text();
    expect(text).toContain("Tool Mount");
    expect(text).toContain("Not Mounted");
  });

  it("selects a resource", () => {
    const el = shallow(<MarkAs {...fakeMarkAsProps()} />);
    const wow = el.find(FBSelect).first();
    expect(wow).toBeTruthy();
    const nextResource = {
      label: "fake resource",
      value: "fake_resource"
    };
    wow.simulate("change", nextResource);
    expect(el.state()).toEqual({ nextResource });
  });

  it("triggers callbacks (commitSelection)", () => {
    const props = fakeMarkAsProps();
    const i = new MarkAs(props);
    i.setState = jest.fn((s: typeof i.state) => {
      i.state = s;
    });
    const nextResource = { label: "should be cleared", value: 1 };
    i.setState({ nextResource });
    expect(i.state.nextResource).toEqual(nextResource);
    i.commitSelection({ label: "stub", value: "mock" });
    expect(i.state.nextResource).toBe(undefined);
    expect(commitStepChanges).toHaveBeenCalled();
    expect(i.state.nextResource).toEqual(undefined);
  });
});
