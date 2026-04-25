import React from "react";
import { render } from "@testing-library/react";
import { StarterTray, StarterTrays } from "../starter_tray";
import { InstancedMesh } from "three";

const mockMesh = () => ({
  setMatrixAt: jest.fn(),
  instanceMatrix: { needsUpdate: false },
}) as unknown as InstancedMesh;

describe("<StarterTray />", () => {
  it("renders a single starter tray", () => {
    const { container } = render(<StarterTray />);

    expect(container).toContainHTML("starter-tray");
    expect(container).toContainHTML("starter-trays");
    expect(container.querySelectorAll("instancedmesh").length).toEqual(2);
  });
});

describe("<StarterTrays />", () => {
  it("renders instanced starter trays and seedlings", () => {
    const { container } = render(<StarterTrays positions={[
      [100, 200, 300],
      [400, 500, 600],
    ]} />);

    expect(container).toContainHTML("starter-tray-bases");
    expect(container).toContainHTML("starter-tray-seedlings");
    expect(container.querySelectorAll("instancedmesh").length).toEqual(2);
    expect(container.querySelectorAll(".billboard").length).toEqual(0);
    expect(container.querySelectorAll(".image").length).toEqual(0);
  });

  it("updates tray and seedling instance matrices", () => {
    const trayMesh = mockMesh();
    const seedlingMesh = mockMesh();
    const useRef = React.useRef;
    const useEffectSpy = jest.spyOn(React, "useEffect")
      .mockImplementationOnce(effect => {
        effect();
      });
    const useRefSpy = jest.spyOn(React, "useRef")
      .mockImplementationOnce(() => ({ current: trayMesh }))
      .mockImplementationOnce(() => ({ current: seedlingMesh }))
      .mockImplementation(useRef);

    render(<StarterTrays positions={[
      [100, 200, 300],
      [400, 500, 600],
    ]} />);

    expect(trayMesh.setMatrixAt).toHaveBeenCalledTimes(2);
    expect(seedlingMesh.setMatrixAt).toHaveBeenCalledTimes(140);
    expect(trayMesh.instanceMatrix.needsUpdate).toBeTruthy();
    expect(seedlingMesh.instanceMatrix.needsUpdate).toBeTruthy();
    useRefSpy.mockRestore();
    useEffectSpy.mockRestore();
  });
});
