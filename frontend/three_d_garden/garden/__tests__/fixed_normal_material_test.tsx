import React from "react";
import { render } from "@testing-library/react";
import {
  MeshStandardMaterial, WebGLProgramParametersWithUniforms, WebGLRenderer,
} from "three";
import { FixedNormalMaterial } from "../fixed_normal_material";

describe("<FixedNormalMaterial />", () => {
  it("modifies shader", () => {
    const mockMaterial = new MeshStandardMaterial();

    jest.spyOn(React, "useCallback").mockImplementation(cb => {
      cb(mockMaterial);
      return cb;
    });

    render(<FixedNormalMaterial />);
    const shader = {
      fragmentShader: "#include <normal_fragment_begin>",
    } as WebGLProgramParametersWithUniforms;
    mockMaterial.onBeforeCompile(shader,
      jest.fn() as unknown as WebGLRenderer);
    expect(shader.fragmentShader).toContain("normal = vec3(0.0, 1.0, 0.0);");
  });

  it("doesn't duplicate shader injection", () => {
    const mockMaterial = new MeshStandardMaterial();

    jest.spyOn(React, "useCallback").mockImplementation(cb => {
      cb(mockMaterial);
      return cb;
    });

    render(<FixedNormalMaterial />);
    const shader = {
      fragmentShader: "#include <normal_fragment_begin>",
    } as WebGLProgramParametersWithUniforms;
    mockMaterial.onBeforeCompile(shader,
      jest.fn() as unknown as WebGLRenderer);
    const updatedShader = shader.fragmentShader;
    mockMaterial.onBeforeCompile(shader,
      jest.fn() as unknown as WebGLRenderer);
    expect(shader.fragmentShader).toEqual(updatedShader);
  });
});
