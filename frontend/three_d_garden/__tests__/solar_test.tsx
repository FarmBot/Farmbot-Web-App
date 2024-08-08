import React from "react";
import { mount } from "enzyme";
import { Solar, SolarProps } from "../solar";
import { INITIAL } from "../config";
import { clone } from "lodash";

describe("<Solar />", () => {
  const fakeProps = (): SolarProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const wrapper = mount(<Solar {...fakeProps()} />);
    expect(wrapper.html()).toContain("solar");
  });
});
