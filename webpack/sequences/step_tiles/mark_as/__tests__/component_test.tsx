import * as React from "react";
import { shallow, mount } from "enzyme";
import { MarkAs } from "../../mark_as";
import { FBSelect } from "../../../../ui";
import { fakeMarkAsProps } from "../assertion_support";

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
});
