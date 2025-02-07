import React from "react";
import { mount } from "enzyme";
import { CrossSlideFull, CrossSlide } from "../cross_slide";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<CrossSlide />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.crossSlide) as CrossSlideFull;
    const Component = CrossSlide(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("instancedmesh");
  });
});
