import { WidgetFooter } from "../widget_footer";
import { mount } from "enzyme";

describe("<WidgetFooter />", () => {
  it("renders text", () => {
    const result = mount(WidgetFooter({ children: "nice" }));
    expect(result.html()).toContain("nice");
  });
});
