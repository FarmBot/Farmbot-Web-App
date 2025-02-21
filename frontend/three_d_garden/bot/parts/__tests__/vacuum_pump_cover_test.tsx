import React from "react";
import { mount } from "enzyme";
import { VacuumPumpCover, VacuumPumpCoverFull } from "../vacuum_pump_cover";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<VacuumPumpCover />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.vacuumPumpCover) as VacuumPumpCoverFull;
    const Component = VacuumPumpCover(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("mesh");
  });
});
