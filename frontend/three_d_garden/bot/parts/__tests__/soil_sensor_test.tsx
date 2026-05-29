import React from "react";
import * as THREE from "three";
import { render } from "@testing-library/react";
import { SoilSensor, SoilSensorFull, SoilSensorModel } from "../soil_sensor";
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

  it("uses merged geometry when instance matrices are available", () => {
    const model = useGLTF(ASSETS.models.soilSensor) as unknown as SoilSensorFull;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(
      new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
      ]),
      3,
    ));
    const matrices = new Float32Array(16);
    new THREE.Matrix4().identity().toArray(matrices, 0);
    const instanceMatrix = new THREE.InstancedBufferAttribute(matrices, 16);
    Object.entries(model.nodes).forEach(([key, node]) => {
      node.geometry = geometry;
      if (/^mesh/.test(key)) {
        node.instanceMatrix = instanceMatrix;
      }
    });
    const { container } = render(<SoilSensorModel model={model} name={"name"} />);
    expect(container.querySelectorAll("instancedmesh")).toHaveLength(0);
    expect(container.querySelectorAll("mesh")).toHaveLength(2);
  });
});
