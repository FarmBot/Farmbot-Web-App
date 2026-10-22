import React from "react";
import * as THREE from "three";
import { render } from "@testing-library/react";
import { SoilSensor, SoilSensorFull, SoilSensorModel } from "../soil_sensor";
import { useGLTF } from "@react-three/drei";
import { ASSETS } from "../../../constants";
import * as components from "../../../components";

describe("<SoilSensor />", () => {
  it("renders", () => {
    const model = useGLTF(ASSETS.models.soilSensor) as unknown as SoilSensorFull;
    const Component = SoilSensor(model);
    const { container } = render(<Component name={"name"} />);
    expect(container.innerHTML).toContain("name");
    expect(container.innerHTML).toContain("instancedmesh");
  });

  it.each([
    [false, false], [false, true], [true, false], [true, true],
  ])(
    "selects hardware material: merged=%s, override=%s", (merged, override) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(
        new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3,
      ));
      const original = new THREE.MeshStandardMaterial();
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: "#333" });
      const hardwareMaterial = override
        ? new THREE.MeshStandardMaterial({ color: "silver" })
        : undefined;
      const hardware = new THREE.Mesh(geometry) as THREE.Mesh & {
        instanceMatrix?: THREE.InstancedBufferAttribute;
      };
      if (merged) {
        hardware.instanceMatrix = new THREE.InstancedBufferAttribute(
          new Float32Array(new THREE.Matrix4().identity().elements), 16,
        );
      }
      const model = {
        nodes: {
          Soil_Sensor: new THREE.Mesh(geometry),
          meshHardware: hardware,
        },
        materials: { PaletteMaterial001: original },
      } as unknown as SoilSensorFull;
      const meshMaterials: unknown[] = [];
      const hardwareMaterials: unknown[] = [];
      const Mesh = components.Mesh;
      const InstancedMesh = components.InstancedMesh;
      const meshSpy = jest.spyOn(components, "Mesh")
        .mockImplementation(props => {
          meshMaterials.push(props.material);
          return <Mesh {...props} />;
        });
      const hardwareSpy = jest.spyOn(components, "InstancedMesh")
        .mockImplementation(props => {
          hardwareMaterials.push(props.args?.[1]);
          return <InstancedMesh {...props} />;
        });
      try {
        render(<SoilSensorModel model={model} bodyMaterial={bodyMaterial}
          hardwareMaterial={hardwareMaterial} />);
        expect([...meshMaterials, ...hardwareMaterials])
          .toEqual([bodyMaterial, hardwareMaterial ?? original]);
      } finally {
        meshSpy.mockRestore();
        hardwareSpy.mockRestore();
      }
    },
  );

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
