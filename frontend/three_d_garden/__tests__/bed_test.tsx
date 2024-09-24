import React from "react";
import { mount } from "enzyme";
import { INITIAL } from "../config";
import { Bed, BedProps } from "../bed";
import { clone } from "lodash";

describe("<Bed />", () => {
  const fakeProps = (): BedProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders bed", () => {
    const p = fakeProps();
    p.config.extraLegsX = 0;
    const wrapper = mount(<Bed {...p} />);
    expect(wrapper.html()).toContain("bed-group");
  });

  it("renders bed with extra legs", () => {
    const p = fakeProps();
    p.config.extraLegsX = 2;
    p.config.extraLegsY = 2;
    p.config.legsFlush = false;
    const wrapper = mount(<Bed {...p} />);
    expect(wrapper.html()).toContain("bed-group");
  });
});
