import * as React from "react";
import { WidgetFooter } from "../widget_footer";
import { mount } from "enzyme";

describe("<WidgetFooter />", () => {
  it("renders text", () => {
    let result = mount(WidgetFooter({ children: "nice" }));
    expect(result.html()).toContain("nice");
  });
});
