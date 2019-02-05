import { ToolTip } from "../tooltip";
import { mount } from "enzyme";

describe("<ToolTip />", () => {
  it("renders correct text", () => {
    const wrapper = mount(ToolTip({ helpText: "such help" }));
    expect(wrapper.find(".title-help-text").html()).toContain("such help");
  });
});
