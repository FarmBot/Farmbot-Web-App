import React from "react";
import { render } from "@testing-library/react";
import { SoilSensor, SoilSensorFull } from "../soil_sensor";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";

describe("<SoilSensor />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.soilSensor) as unknown as SoilSensorFull;
    const Component = SoilSensor(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("instancedmesh");
  });
});
