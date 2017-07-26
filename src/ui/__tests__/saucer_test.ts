import * as React from "react";
import { Saucer } from "../Saucer";
import { mount } from "enzyme";

describe("<Saucer />", () => {
  let params = { color: "blue", active: true };
  it("renders with correct classes", () => {
    let result = mount(Saucer(params));
    expect(result.find("div").hasClass("blue")).toBeTruthy();
    expect(result.find("div").hasClass("active")).toBeTruthy();
  });
});
