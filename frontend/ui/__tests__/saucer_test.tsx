import { Saucer } from "../saucer";
import { mount } from "enzyme";

describe("<Saucer />", () => {
  const params = { color: "blue", active: true };
  it("renders with correct classes", () => {
    const result = mount(Saucer(params));
    expect(result.find("div").hasClass("blue")).toBeTruthy();
    expect(result.find("div").hasClass("active")).toBeTruthy();
  });
});
