import React from "react";
import { mount } from "enzyme";
import { Packaging, PackagingProps } from "../packaging";
import { INITIAL } from "../config";
import { clone } from "lodash";

describe("<Packaging />", () => {
  const fakeProps = (): PackagingProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const wrapper = mount(<Packaging {...fakeProps()} />);
    expect(wrapper.html()).toContain("packaging");
    expect(wrapper.html()).toContain("100");
    expect(wrapper.html()).not.toContain("170");
  });

  it("renders: XL", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis XL";
    const wrapper = mount(<Packaging {...p} />);
    expect(wrapper.html()).toContain("170");
    expect(wrapper.html()).not.toContain("100");
  });
});
