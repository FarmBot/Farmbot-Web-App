import React from "react";
import { mount } from "enzyme";
import { LeftPanel, LeftPanelProps } from "../left_panel";

describe("<LeftPanel />", () => {
  const fakeProps = (): LeftPanelProps => ({
    className: "left",
    title: "title",
  });

  it("renders", () => {
    const wrapper = mount(<LeftPanel {...fakeProps()} />);
    expect(wrapper.text()).toContain("title");
  });
});
