import { Markdown } from "../markdown";
import { mount } from "enzyme";

describe("<Markdown />", () => {
  it("renders text", () => {
    const result = mount(Markdown({ children: "nice" }));
    expect(result.html()).toContain("nice");
  });
});
