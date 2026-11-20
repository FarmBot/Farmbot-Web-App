import React from "react";
import { render } from "@testing-library/react";
import { VacuumPumpCover, VacuumPumpCoverFull } from "../vacuum_pump_cover";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<VacuumPumpCover />", () => {
  it.each([false, true])("mounts the screw heads outside with reverse=%s",
    reverseMountScrews => {
      const model = useGLTF(
        ASSETS.models.vacuumPumpCover,
      ) as unknown as VacuumPumpCoverFull;
      const Component = VacuumPumpCover(model);
      const { container } = render(
        <Component reverseMountScrews={reverseMountScrews} />,
      );
      const screw = container.querySelector("mesh");
      const z = reverseMountScrews ? -245 : -145;
      const rotationX = reverseMountScrews ? -Math.PI / 2 : Math.PI / 2;
      expect(screw).toHaveAttribute("position", `-10,-13,${z}`);
      expect(screw).toHaveAttribute("rotation", `${rotationX},0,0`);
    },
  );

  it("renders", () => {
    const model = useGLTF(ASSETS.models.vacuumPumpCover) as unknown as VacuumPumpCoverFull;
    const Component = VacuumPumpCover(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("mesh");
  });
});
