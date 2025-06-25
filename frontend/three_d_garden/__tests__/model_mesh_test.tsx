import React from "react";
import { render } from "@testing-library/react";
import { Model, ModelMesh, ModelMeshProps } from "../model_mesh";
import { Mesh, MeshStandardMaterial } from "three";

describe("<ModelMesh />", () => {
  const fakeProps = (): ModelMeshProps => ({
    name: "Test Model",
    model: {
      nodes: { mesh: { geometry: {} } as Mesh },
      materials: { material: {} as MeshStandardMaterial },
    } as Model,
  });

  it("renders", () => {
    const { container } = render(<ModelMesh {...fakeProps()} />);
    expect(container).toContainHTML("Test Model");
  });
});
