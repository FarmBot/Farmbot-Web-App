import React from "react";
import { mount } from "enzyme";
import { Sun, SunProps } from "../sun";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Sun />", () => {
  const fakeProps = (): SunProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const wrapper = mount(<Sun {...fakeProps()} />);
    expect(wrapper.html()).toContain("sun");
  });
});
