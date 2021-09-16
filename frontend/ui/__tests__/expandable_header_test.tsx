import React from "react";
import { shallow } from "enzyme";
import { ExpandableHeader, ExpandableHeaderProps } from "../expandable_header";

describe("<ExpandableHeader />", () => {
  const fakeProps = (): ExpandableHeaderProps => ({
    onClick: jest.fn(),
    title: "title",
    expanded: true,
  });

  it("renders", () => {
    const wrapper = shallow(<ExpandableHeader {...fakeProps()} />);
    expect(wrapper.text()).toContain("title");
  });
});
