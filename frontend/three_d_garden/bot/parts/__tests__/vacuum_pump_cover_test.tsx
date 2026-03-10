import React from "react";
import { render } from "@testing-library/react";
import { VacuumPumpCover, VacuumPumpCoverFull } from "../vacuum_pump_cover";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<VacuumPumpCover />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.vacuumPumpCover) as unknown as VacuumPumpCoverFull;
    const Component = VacuumPumpCover(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("mesh");
  });
});
