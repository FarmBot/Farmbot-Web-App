import React from "react";
import { mount } from "enzyme";
import { StepWarning, conflictsString } from "../step_warning";

describe("<StepWarning />", () => {
  it("renders", () => {
    const wrapper = mount(<StepWarning warning={"warning"} />);
    expect(wrapper.find("i").hasClass("fa-exclamation-triangle")).toBeTruthy();
    expect(wrapper.html()).toContain("Hardware setting conflict");
  });

  it("lists axes", () => {
    const wrapper = mount(<StepWarning
      warning={"warning"}
      conflicts={{ x: true, y: true, z: false }} />);
    expect(wrapper.find("i").hasClass("fa-exclamation-triangle")).toBeTruthy();
    expect(wrapper.html()).toContain("Hardware setting conflict: x, y");
  });

  it("conflictsString()", () => {
    expect(conflictsString({ x: true, y: true, z: false })).toEqual("x, y");
    expect(conflictsString({ x: true, y: false, z: false })).toEqual("x");
    expect(conflictsString({ x: false, y: false, z: false })).toEqual("");
  });
});
