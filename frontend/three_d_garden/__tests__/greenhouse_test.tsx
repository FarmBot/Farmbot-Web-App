import React from "react";
import { mount } from "enzyme";
import { Greenhouse, GreenhouseProps } from "../greenhouse";
import { INITIAL } from "../config";
import { clone } from "lodash";

describe("<Greenhouse />", () => {
  const fakeProps = (): GreenhouseProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.people = false;
    p.activeFocus = "";
    const wrapper = mount(<Greenhouse {...p} />);
    expect(wrapper.html()).toContain("greenhouse-environment");
    expect(wrapper.find({ name: "people" }).first().props().visible).toBeFalsy();
  });

  it("renders with people", () => {
    const p = fakeProps();
    p.config.people = true;
    p.activeFocus = "";
    const wrapper = mount(<Greenhouse {...p} />);
    expect(wrapper.find({ name: "people" }).first().props().visible).toBeTruthy();
  });
});
