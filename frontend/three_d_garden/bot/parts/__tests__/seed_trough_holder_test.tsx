import React from "react";
import { mount } from "enzyme";
import { SeedTroughHolder, SeedTroughHolderFull } from "../seed_trough_holder";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<SeedTroughHolder />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.seedTroughHolder) as SeedTroughHolderFull;
    const Component = SeedTroughHolder(model);
    const wrapper = mount(<Component name={"name"} />);
    expect(wrapper.html()).toContain("name");
    expect(wrapper.html()).toContain("mesh");
  });
});
