import React from "react";
import { render } from "@testing-library/react";
import {
  MeshStandardMaterial, WebGLProgramParametersWithUniforms, WebGLRenderer,
} from "three";
import { FixedNormalMaterial } from "../fixed_normal_material";

describe("<FixedNormalMaterial />", () => {
  it("modifies shader", () => {
    const mockMaterial = new MeshStandardMaterial();
    mockMaterial.userData = {};

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
    expect(mockMaterial.userData.shaderInjected).toBeTruthy();
    expect(shader.fragmentShader).toContain("normal = vec3(0.0, 1.0, 0.0);");
  });

  it("doesn't modify shader", () => {
    const mockMaterial = new MeshStandardMaterial();
    mockMaterial.userData = { shaderInjected: true };

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
    expect(mockMaterial.userData.shaderInjected).toBeTruthy();
    expect(shader.fragmentShader).not.toContain("normal = vec3(0.0, 1.0, 0.0);");
  });
});
