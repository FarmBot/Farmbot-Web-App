import React from "react";
import { Spinner } from "../spinner";
import { mount } from "enzyme";

describe("spinner", () => {
  it("renders defaults", () => {
    const spinner = mount(<Spinner />);
    const circles = spinner.find("circle");
    expect(circles.props().cx).toEqual(10);
    expect(circles.props().strokeWidth).toEqual(3);
    expect(spinner.find("svg").props().viewBox).toEqual("0 0 20.5 20.5");
  });

  it("renders inputs", () => {
    const spinner = mount(<Spinner radius={50} strokeWidth={5} wobble={1} />);
    const circles = spinner.find("circle");
    expect(circles.props().cx).toEqual(50);
    expect(circles.props().strokeWidth).toEqual(5);
    expect(spinner.find("svg").props().viewBox).toEqual("0 0 101 101");
  });
});
