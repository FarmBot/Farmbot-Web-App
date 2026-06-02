import React from "react";
import { render } from "@testing-library/react";
import { GantryWheelPlate, GantryWheelPlateFull } from "../gantry_wheel_plate";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";
import * as THREE from "three";

describe("<GantryWheelPlate />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.gantryWheelPlate) as unknown as GantryWheelPlateFull;
    const Component = GantryWheelPlate(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.querySelector("mesh, instancedmesh")).toBeTruthy();
  });

  it("renders merged instanced geometry", () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
      3,
    ));
    const matrices = new Float32Array(16);
    new THREE.Matrix4().identity().toArray(matrices);
    const model = {
      nodes: {
        Gantry_Wheel_Plate: { geometry } as THREE.Mesh,
        mesh141_mesh: {
          geometry,
          instanceMatrix: new THREE.InstancedBufferAttribute(matrices, 16),
        },
      },
      materials: {
        PaletteMaterial001: new THREE.MeshStandardMaterial(),
      },
    } as unknown as GantryWheelPlateFull;
    const Component = GantryWheelPlate(model);

    const { container } = render(<Component name={"name"} />);

    expect(container.querySelectorAll("mesh").length).toEqual(2);
    expect(container.querySelector("instancedmesh")).toBeNull();
  });
});
