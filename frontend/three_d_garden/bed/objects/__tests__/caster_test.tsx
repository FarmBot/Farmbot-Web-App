import React from "react";
import { mount } from "enzyme";
import { Caster, CasterProps } from "../caster";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<Caster />", () => {
  const fakeProps = (): CasterProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const wrapper = mount(<Caster {...fakeProps()} />);
    expect(wrapper.html()).toContain("cylinder");
    expect(wrapper.html()).toContain("extrude");
  });
});
