import React from "react";
import { mount } from "enzyme";
import { CenterPanel, CenterPanelProps } from "../center_panel";

describe("<CenterPanel />", () => {
  const fakeProps = (): CenterPanelProps => ({
    className: "center",
    title: "title",
  });

  it("renders", () => {
    const wrapper = mount(<CenterPanel {...fakeProps()} />);
    expect(wrapper.text()).toContain("title");
  });
});
