import { mount } from "enzyme";
import {
  ThreeDGardenProps, ThreeDGarden,
} from "../index";
import React from "react";
import { INITIAL } from "../config";
import { clone } from "lodash";
import { fakeAddPlantProps } from "../../__test_support__/fake_props";

describe("<ThreeDGarden />", () => {
  const fakeProps = (): ThreeDGardenProps => ({
    config: clone(INITIAL),
    addPlantProps: fakeAddPlantProps([]),
    mapPoints: [],
    weeds: [],
  });

  it("renders", () => {
    const wrapper = mount(<ThreeDGarden {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});
