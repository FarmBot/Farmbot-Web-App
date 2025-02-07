import React from "react";
import { mount } from "enzyme";
import { RotaryTool, RotaryToolFull } from "../rotary_tool";
import { ASSETS } from "../../../constants";
import { useGLTF } from "@react-three/drei";

describe("<RotaryTool />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.rotaryTool) as RotaryToolFull;
    const Component = RotaryTool(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("instancedmesh");
  });
});
