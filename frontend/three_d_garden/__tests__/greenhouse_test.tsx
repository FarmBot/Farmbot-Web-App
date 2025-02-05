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
    expect(wrapper.html()).toContain("starter-tray-1");
    expect(wrapper.html()).toContain("starter-tray-2");
    expect(wrapper.html()).toContain("left-greenhouse-wall");
    expect(wrapper.html()).toContain("right-greenhouse-wall");
    expect(wrapper.html()).toContain("potted-plant");
  });

  it("not visible when scene is not greenhouse", () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    const wrapper = mount(<Greenhouse {...p} />);
    expect(wrapper.find({ name: "greenhouse-environment" }).first().props().visible).toBeFalsy();
  });

  it("renders with people", () => {
    const p = fakeProps();
    p.config.people = true;
    p.activeFocus = "";
    const wrapper = mount(<Greenhouse {...p} />);
    expect(wrapper.find({ name: "people" }).first().props().visible).toBeTruthy();
  });

  it("doesn't render people or potted plant when active focus is set", () => {
    const p = fakeProps();
    p.config.people = true;
    p.activeFocus = "foo";
    const wrapper = mount(<Greenhouse {...p} />);
    expect(wrapper.find({ name: "people" }).first().props().visible).toBeFalsy();
    expect(wrapper.find({ name: "potted-plant" }).first().props().visible).toBeFalsy();
  });
});
