import React from "react";
import { mount } from "enzyme";
import { GantryWheelPlate, GantryWheelPlateFull } from "../gantry_wheel_plate";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<GantryWheelPlate />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.gantryWheelPlate) as GantryWheelPlateFull;
    const Component = GantryWheelPlate(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("instancedmesh");
  });
});
