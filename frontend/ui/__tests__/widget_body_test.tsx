import React from "react";
import { mount } from "enzyme";
import { WidgetBody } from "../widget_body";

describe("<WidgetBody />", () => {
  it("renders body", () => {
    const wrapper = mount(<WidgetBody>content</WidgetBody>);
    expect(wrapper.text()).toContain("content");
  });
});
