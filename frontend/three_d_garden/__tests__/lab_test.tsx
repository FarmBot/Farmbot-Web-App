import React from "react";
import { mount } from "enzyme";
import { Lab, LabProps } from "../lab";
import { INITIAL } from "../config";
import { clone } from "lodash";

describe("<Lab />", () => {
  const fakeProps = (): LabProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.people = false;
    p.activeFocus = "";
    const wrapper = mount(<Lab {...p} />);
    expect(wrapper.html()).toContain("lab");
    expect(wrapper.find({ name: "people" }).first().props().visible).toBeFalsy();
  });

  it("renders with people", () => {
    const p = fakeProps();
    p.config.people = true;
    p.activeFocus = "";
    const wrapper = mount(<Lab {...p} />);
    expect(wrapper.find({ name: "people" }).first().props().visible).toBeTruthy();
  });
});
