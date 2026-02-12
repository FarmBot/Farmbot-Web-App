import React from "react";
import { render } from "@testing-library/react";
import { SeedTroughHolder, SeedTroughHolderFull } from "../seed_trough_holder";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<SeedTroughHolder />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.seedTroughHolder) as SeedTroughHolderFull;
    const Component = SeedTroughHolder(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("mesh");
  });
});
