import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { clone } from "lodash";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { INITIAL } from "../../config";
import {
  CustomMaterial,
  ThreeDPlant,
  ThreeDPlantProps,
} from "../plants";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { convertPlants } from "../../../farm_designer/three_d_garden_map";
import {
  MeshStandardMaterial, WebGLProgramParametersWithUniforms, WebGLRenderer,
} from "three";

describe("<ThreeDPlant />", () => {
  const fakeProps = (): ThreeDPlantProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    return {
      plant: convertPlants(config, [plant])[0],
      i: 0,
      config: config,
      hoveredPlant: undefined,
      visible: true,
      getZ: () => 0,
    };
  };

  it("renders label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    p.labelOnly = true;
    render(<ThreeDPlant {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders hovered label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.hoveredPlant = 0;
    p.labelOnly = true;
    render(<ThreeDPlant {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders plant", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.labelOnly = false;
    p.config.light = false;
    render(<ThreeDPlant {...p} />);
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("avif");
  });

  it("renders plant under light", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.labelOnly = false;
    p.config.light = true;
    render(<ThreeDPlant {...p} />);
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("avif");
  });

  it("navigates to plant info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.plant.id = 1;
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0'");
    plant && fireEvent.click(plant);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("1"));
  });

  it("doesn't navigate to plant info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.plant.id = 1;
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0'");
    plant && fireEvent.click(plant);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("<CustomMaterial />", () => {
  it("modifies shader", () => {
    const mockMaterial = new MeshStandardMaterial();
    mockMaterial.userData = {};

    jest.spyOn(React, "useCallback").mockImplementation(cb => {
      cb(mockMaterial);
      return cb;
    });

    render(<CustomMaterial />);
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

    render(<CustomMaterial />);
    const shader = {
      fragmentShader: "#include <normal_fragment_begin>",
    } as WebGLProgramParametersWithUniforms;
    mockMaterial.onBeforeCompile(shader,
      jest.fn() as unknown as WebGLRenderer);
    expect(mockMaterial.userData.shaderInjected).toBeTruthy();
    expect(shader.fragmentShader).not.toContain("normal = vec3(0.0, 1.0, 0.0);");
  });
});
