import React from "react";
import { mount } from "enzyme";
import { Packaging, PackagingProps } from "../packaging";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<Packaging />", () => {
  const fakeProps = (): PackagingProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.packaging = true;
    p.config.kitVersion = "v1.n";
    const wrapper = mount(<Packaging {...p} />);
    expect(wrapper.html()).toContain("packaging");
    expect(wrapper.html()).not.toContain("100");
    expect(wrapper.html()).not.toContain("170");
  });

  it("renders: v1.7 XL", () => {
    const p = fakeProps();
    p.config.packaging = true;
    p.config.sizePreset = "Genesis XL";
    p.config.kitVersion = "v1.7";
    const wrapper = mount(<Packaging {...p} />);
    expect(wrapper.html()).toContain("170");
    expect(wrapper.html()).not.toContain("100");
  });

  it("renders: v1.8 XL", () => {
    const p = fakeProps();
    p.config.packaging = true;
    p.config.sizePreset = "Genesis XL";
    p.config.kitVersion = "v1.8";
    const wrapper = mount(<Packaging {...p} />);
    expect(wrapper.html()).not.toContain("170");
    expect(wrapper.html()).not.toContain("100");
  });
});
