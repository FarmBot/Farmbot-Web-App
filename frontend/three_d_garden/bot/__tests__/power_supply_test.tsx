import React from "react";
import { mount } from "enzyme";
import { PowerSupply, PowerSupplyProps } from "../power_supply";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<PowerSupply />", () => {
  const fakeProps = (): PowerSupplyProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const wrapper = mount(<PowerSupply {...fakeProps()} />);
    expect(wrapper.html()).toContain("powerSupplyGroup");
    expect(wrapper.html()).toContain("#222");
    expect(wrapper.html()).not.toContain("hsl(");
  });

  it("renders cable debug mode", () => {
    const p = fakeProps();
    p.config.cableDebug = true;
    const wrapper = mount(<PowerSupply {...p} />);
    expect(wrapper.html()).toContain("hsl(");
    expect(wrapper.html()).not.toContain("#222");
  });
});
