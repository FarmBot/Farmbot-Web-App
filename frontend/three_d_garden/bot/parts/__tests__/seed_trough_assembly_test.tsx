import React from "react";
import { mount } from "enzyme";
import {
  SeedTroughAssembly, SeedTroughAssemblyFull,
} from "../seed_trough_assembly";
import { ASSETS } from "../../../constants";
import { useGLTF } from "@react-three/drei";

describe("<SeedTroughAssembly />", () => {
  it("renders", () => {
    const model = useGLTF(
      ASSETS.models.seedTroughAssembly) as SeedTroughAssemblyFull;
    const Component = SeedTroughAssembly(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("mesh");
  });
});
