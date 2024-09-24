import { mount } from "enzyme";
import {
  ThreeDGardenProps, ThreeDGarden,
} from "../index";
import React from "react";
import { INITIAL } from "../config";
import { clone } from "lodash";

describe("<ThreeDGarden />", () => {
  const fakeProps = (): ThreeDGardenProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const wrapper = mount(<ThreeDGarden {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
