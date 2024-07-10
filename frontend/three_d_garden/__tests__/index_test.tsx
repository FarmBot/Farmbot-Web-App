jest.mock("@react-three/drei", () => {
  return {
    Box: () => <div />,
    Circle: () => <div />,
    PerspectiveCamera: () => <div />,
    OrbitControls: () => <div />,
  };
});

jest.mock("@react-three/fiber", () => ({
  Canvas: () => <div />,
  addEffect: jest.fn(),
}));

import { mount } from "enzyme";
import {
  ThreeDGardenProps, ThreeDGarden,
  ThreeDGardenModel, ThreeDGardenModelProps,

} from "..";
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

describe("<ThreeDGardenModel />", () => {
  const fakeProps = (): ThreeDGardenModelProps => ({
    config: clone(INITIAL),
  });

  it("renders model", () => {
    const wrapper = mount(<ThreeDGardenModel {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden-model");
  });
});
