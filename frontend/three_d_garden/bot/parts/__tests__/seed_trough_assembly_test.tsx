import React from "react";
import { render } from "@testing-library/react";
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
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("mesh");
  });
});
