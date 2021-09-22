import React from "react";
import { mount } from "enzyme";
import { RightPanel, RightPanelProps } from "../right_panel";

describe("<RightPanel />", () => {
  const fakeProps = (): RightPanelProps => ({
    className: "right",
    title: "title",
    helpText: "help",
    show: true,
  });

  it("renders", () => {
    const wrapper = mount(<RightPanel {...fakeProps()} />);
    expect(wrapper.text()).toContain("title");
  });
});
