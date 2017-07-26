import * as React from "react";
import { BackArrow } from "../back_arrow";
import { mount } from "enzyme";

describe("<BackArrow />", () => {
  it("renders", () => {
    let element = mount(BackArrow());
    expect(element).toBeTruthy();
  });
});
