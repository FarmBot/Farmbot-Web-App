import React from "react";
import { mount } from "enzyme";
import { SoilSensor, SoilSensorFull } from "../soil_sensor";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<SoilSensor />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.soilSensor) as SoilSensorFull;
    const Component = SoilSensor(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("instancedmesh");
  });
});
