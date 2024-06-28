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

describe("<ThreeDGarden />", () => {
  const fakeProps = (): ThreeDGardenProps => ({
  });

  it("renders", () => {
    const wrapper = mount(<ThreeDGarden {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden");
  });
});

describe("<ThreeDGardenModel />", () => {
  const fakeProps = (): ThreeDGardenModelProps => ({
  });

  it("renders model", () => {
    const wrapper = mount(<ThreeDGardenModel {...fakeProps()} />);
    expect(wrapper.html()).toContain("three-d-garden-model");
  });
});
