import * as React from "react";
import { Help } from "../help";
import { mount } from "enzyme";

describe("<Help />", () => {
  it("renders text", () => {
    let result = mount(Help({ text: "nice" }));
    expect(result.html()).toContain("nice");
  });
});
