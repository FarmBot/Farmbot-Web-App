import React from "react";
import { render } from "@testing-library/react";
import { GantryWheelPlate, GantryWheelPlateFull } from "../gantry_wheel_plate";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<GantryWheelPlate />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.gantryWheelPlate) as GantryWheelPlateFull;
    const Component = GantryWheelPlate(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("instancedmesh");
  });
});
