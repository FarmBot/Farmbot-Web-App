interface MockRef {
  current: {
    scale?: { set: Function; };
    position?: { z: number; };
    setMatrixAt?: Function;
    instanceMatrix?: { needsUpdate: boolean };
    color?: { setScalar: Function };
  } | undefined;
}
let mockRefImpl = (): MockRef => ({
  current: {
    scale: { set: jest.fn() },
    position: { z: 0 },
    setMatrixAt: jest.fn(),
    instanceMatrix: { needsUpdate: false },
  }
});
let allRefs: MockRef[] = [];

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { clone, range } from "lodash";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  InstancedMesh as ThreeInstancedMesh,
  Quaternion,
  type Intersection,
  type Raycaster,
} from "three";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { INITIAL } from "../../config";
import {
  PlantInstances,
  PlantInstancesProps,
  plantIconBrightness,
} from "../plant_instances";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { convertPlants } from "../../../farm_designer/three_d_garden_map";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { setMockInstanceId } from "../../../__test_support__/three_d_mocks";
import { PLANT_ICON_ATLAS } from "../plant_icon_atlas";
import { Mode } from "../../../farm_designer/map/interfaces";
import * as mapUtil from "../../../farm_designer/map/util";
import * as meshKey from "../instanced_mesh_key";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<PlantInstances />", () => {
  let reactUseRefSpy: jest.SpyInstance;
  let getModeSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRefImpl = () => ({
      current: {
        scale: { set: jest.fn() },
        position: { z: 0 },
        setMatrixAt: jest.fn(),
        instanceMatrix: { needsUpdate: false },
      }
    });
    allRefs = [];
    reactUseRefSpy = jest.spyOn(React, "useRef")
      .mockImplementation(() => {
        const ref = mockRefImpl();
        allRefs.push(ref);
        return ref;
      });
    location.pathname = Path.mock(Path.designer());
    (useFrame as jest.Mock).mockClear();
    (useTexture as unknown as jest.Mock).mockClear();
    (useFrame as jest.Mock).mockImplementation((frameFn: Function) => frameFn({
      clock: { getElapsedTime: jest.fn(() => 0) },
      camera: { quaternion: new Quaternion() },
    }));
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
  });

  afterEach(() => {
    reactUseRefSpy.mockRestore();
    getModeSpy.mockRestore();
    delete PLANT_ICON_ATLAS["/crops/icons/beet.avif"];
    delete PLANT_ICON_ATLAS["/crops/icons/strawberry.avif"];
    Object.keys(PLANT_ICON_ATLAS)
      .filter(key => key.startsWith("/crops/icons/round92-"))
      .forEach(key => delete PLANT_ICON_ATLAS[key]);
  });

  const fakeProps = (): PlantInstancesProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    plant.body.id = 1;
    const otherPlant = fakePlant();
    otherPlant.body.id = 2;
    otherPlant.body.openfarm_slug = "carrot";
    const plants = convertPlants(config, [plant, otherPlant]);
    plants[1].icon = "https://example.com/icon-2.avif";
    return {
      plants: plants,
      config: config,
      getZ: () => 0,
      visible: true,
    };
  };

  it("renders instanced meshes per icon", () => {
    const { container } = render(<PlantInstances {...fakeProps()} />);
    const meshes = container.querySelectorAll("instancedmesh");
    expect(meshes.length).toBe(2);
  });

  it("skips hidden plant icon instances", () => {
    const p = fakeProps();
    p.visible = false;
    const { container } = render(<PlantInstances {...p} />);
    expect(container.querySelectorAll("instancedmesh").length).toBe(0);
    expect(useTexture).not.toHaveBeenCalled();
    expect(useFrame).not.toHaveBeenCalled();
  });

  it("uses reserved icon capacity while rendering only active plants", () => {
    const p = fakeProps();
    p.plants = [p.plants[0]];
    p.iconCapacities = { [p.plants[0].icon]: 10 };
    const { container } = render(<PlantInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    expect(mesh?.getAttribute("args")).toContain("10");
    expect(mesh?.getAttribute("count")).toEqual("1");
  });

  it("keeps reserved capacities for multiple active icon buckets", () => {
    const p = fakeProps();
    p.iconCapacities = {
      [p.plants[0].icon]: 4,
      [p.plants[1].icon]: 5,
      "https://example.com/inactive-icon.avif": 6,
    };
    const wrapper = createRenderer(<PlantInstances {...p} />);

    const meshes = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh");
    expect(meshes.length).toEqual(2);
    expect(meshes.map(mesh => mesh.props.args[2]).sort()).toEqual([4, 5]);
    expect(meshes.map(mesh => mesh.props.count)).toEqual([1, 1]);
    expect(meshes.map(mesh => mesh.props.userData.plantIndexes)).toEqual([
      [0],
      [1],
    ]);
    unmountRenderer(wrapper);
  });

  it("skips reserved icon meshes without active plants", () => {
    const p = fakeProps();
    p.plants = [p.plants[0]];
    p.iconCapacities = {
      [p.plants[0].icon]: 10,
      "https://example.com/inactive-icon.avif": 5,
    };
    const { container } = render(<PlantInstances {...p} />);
    const meshes = container.querySelectorAll("instancedmesh");
    expect(meshes.length).toBe(1);
    expect(useTexture).not.toHaveBeenCalledWith(
      "https://example.com/inactive-icon.avif");
  });

  it("disables frustum culling for billboarded plant icons", () => {
    const wrapper = createRenderer(<PlantInstances {...fakeProps()} />);
    const mesh = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh")[0];
    expect(mesh.props.frustumCulled).toEqual(false);
    unmountRenderer(wrapper);
  });

  it("shares plant icon geometry across icon buckets", () => {
    const wrapper = createRenderer(<PlantInstances {...fakeProps()} />);
    const meshes = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh");
    expect(meshes.length).toEqual(2);
    expect(meshes[0].props.args[0]).toBe(meshes[1].props.args[0]);
    unmountRenderer(wrapper);
  });

  it("doesn't build per-plant mesh keys while rendering", () => {
    const keySpy = jest.spyOn(meshKey, "instancedMeshKey");
    render(<PlantInstances {...fakeProps()} />);
    expect(keySpy).not.toHaveBeenCalled();
    keySpy.mockRestore();
  });

  it("loads the atlas texture when an icon is mapped", () => {
    PLANT_ICON_ATLAS["/crops/icons/strawberry.avif"] = {
      atlasUrl: "/crops/icons/atlas.avif",
      textureWidth: 256,
      textureHeight: 256,
      x: 0,
      y: 0,
      width: 64,
      height: 64,
    };
    const { container } = render(<PlantInstances {...fakeProps()} />);

    expect(useTexture).toHaveBeenCalledWith("/crops/icons/atlas.avif");
    expect(container.querySelectorAll("instancedmesh").length).toBe(2);
  });

  it("loads the atlas texture when many mapped icons are visible", () => {
    const p = fakeProps();
    p.plants = range(32).map(index => {
      const icon = `/crops/icons/round92-${index}.avif`;
      PLANT_ICON_ATLAS[icon] = {
        atlasUrl: "/crops/icons/atlas.avif",
        textureWidth: 256,
        textureHeight: 256,
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      };
      return {
        ...p.plants[0],
        id: index + 1,
        icon,
      };
    });

    const { container } = render(<PlantInstances {...p} />);

    expect(useTexture).toHaveBeenCalledWith("/crops/icons/atlas.avif");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
  });

  it("keeps non-atlas icons individual when atlas rendering is active", () => {
    const p = fakeProps();
    p.plants = range(32).map(index => {
      const icon = index == 31
        ? "https://example.com/non-atlas.avif"
        : `/crops/icons/round92-${index}.avif`;
      if (index != 31) {
        PLANT_ICON_ATLAS[icon] = {
          atlasUrl: "/crops/icons/atlas.avif",
          textureWidth: 256,
          textureHeight: 256,
          x: 0,
          y: 0,
          width: 64,
          height: 64,
        };
      }
      return {
        ...p.plants[0],
        id: index + 1,
        icon,
      };
    });

    const { container } = render(<PlantInstances {...p} />);

    expect(useTexture).toHaveBeenCalledWith("/crops/icons/atlas.avif");
    expect(useTexture).toHaveBeenCalledWith(
      "https://example.com/non-atlas.avif");
    expect(container.querySelectorAll("instancedmesh").length).toBe(2);
  });

  it("injects atlas UV attributes into plant icon shaders", () => {
    const p = fakeProps();
    p.plants = range(32).map(index => {
      const icon = `/crops/icons/round92-${index}.avif`;
      PLANT_ICON_ATLAS[icon] = {
        atlasUrl: "/crops/icons/atlas.avif",
        textureWidth: 256,
        textureHeight: 256,
        x: 0,
        y: 0,
        width: 64,
        height: 64,
      };
      return {
        ...p.plants[0],
        id: index + 1,
        icon,
      };
    });
    const wrapper = createRenderer(<PlantInstances {...p} />);
    const material = wrapper.root.find(node =>
      typeof node.props.onBeforeCompile == "function");
    const shader = {
      vertexShader: "#include <common>\n#include <uv_vertex>",
    };

    material.props.onBeforeCompile(shader);

    expect(shader.vertexShader).toContain("instanceUvOffset");
    expect(shader.vertexShader).toContain("instanceUvRepeat");
    unmountRenderer(wrapper);
  });

  it("clamps plant icon brightness", () => {
    expect(plantIconBrightness(undefined)).toEqual(1);
    expect(plantIconBrightness(0)).toEqual(0.25);
    expect(plantIconBrightness(0.1)).toEqual(0.25);
    expect(plantIconBrightness(0.25)).toEqual(0.25);
    expect(plantIconBrightness(1.4)).toEqual(1.4);
  });

  it("navigates to plant info", () => {
    setMockInstanceId(0);
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 0 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("1"));
  });

  it("doesn't navigate after orbiting over a plant icon", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const wrapper = createRenderer(<PlantInstances {...p} />);
    const mesh = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh")[0];
    mesh.props.onClick({ instanceId: 0, delta: 3 });
    unmountRenderer(wrapper);
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate without dispatch", () => {
    setMockInstanceId(0);
    const p = fakeProps();
    const { container } = render(<PlantInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 0 });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate in camera selection mode", () => {
    getModeSpy.mockReturnValue(Mode.cameraSelection);
    setMockInstanceId(0);
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 0 });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  const iconRaycast = (p = fakeProps()) => {
    const wrapper = createRenderer(<PlantInstances {...p} />);
    const mesh = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh")[0];
    const raycast = mesh.props.raycast as (
      this: ThreeInstancedMesh,
      raycaster: Raycaster,
      intersects: Intersection[],
    ) => void;
    unmountRenderer(wrapper);
    return raycast;
  };

  it.each([
    Mode.clickToAdd,
    Mode.createPoint,
    Mode.createWeed,
  ])("allows %s raycasts through plant icons", mode => {
    getModeSpy.mockReturnValue(mode);
    const defaultRaycast = jest.spyOn(
      ThreeInstancedMesh.prototype,
      "raycast",
    );
    const intersects: Intersection[] = [];
    const raycaster = {} as Raycaster;
    iconRaycast().call({} as ThreeInstancedMesh, raycaster, intersects);
    expect(defaultRaycast).not.toHaveBeenCalled();
    expect(intersects).toEqual([]);
    defaultRaycast.mockRestore();
  });

  it("keeps plant icon raycasts outside placement modes", () => {
    getModeSpy.mockReturnValue(Mode.none);
    const defaultRaycast = jest.spyOn(
      ThreeInstancedMesh.prototype,
      "raycast",
    ).mockImplementation(() => undefined);
    const intersects: Intersection[] = [];
    const raycaster = {} as Raycaster;
    iconRaycast().call({} as ThreeInstancedMesh, raycaster, intersects);
    expect(defaultRaycast).toHaveBeenCalledWith(raycaster, intersects);
    defaultRaycast.mockRestore();
  });

  it("doesn't navigate with missing instanceId", () => {
    setMockInstanceId(undefined);
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: undefined });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate with missing plant", () => {
    setMockInstanceId(99);
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 99 });
    expect(dispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles undefined start time", () => {
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: undefined as unknown as number };
    const { container } = render(<PlantInstances {...p} />);
    expect(container).toBeTruthy();
  });

  it("skips time lookup without season animation", () => {
    let frameFn: Function | undefined;
    (useFrame as jest.Mock).mockImplementation((fn: Function) => {
      frameFn = fn;
    });
    const now = jest.spyOn(performance, "now").mockReturnValue(1000);
    const p = fakeProps();
    p.config.animateSeasons = false;
    render(<PlantInstances {...p} />);
    now.mockClear();
    frameFn?.({
      clock: { getElapsedTime: jest.fn(() => 0) },
      camera: { quaternion: new Quaternion() },
    });
    expect(now).not.toHaveBeenCalled();
    now.mockRestore();
  });

  it("handles missing ref", () => {
    mockRefImpl = () => ({ current: undefined });
    const p = fakeProps();
    const { container } = render(<PlantInstances {...p} />);
    expect(container).toBeTruthy();
  });

  it("uses garden coordinates for getZ", () => {
    const getZ = jest.fn(() => 0);
    const p = fakeProps();
    p.getZ = getZ;
    p.plants = [p.plants[0]];
    render(<PlantInstances {...p} />);
    expect(getZ).toHaveBeenCalledWith(100, 200);
  });

  it("uses mirrored world placement for plant icons", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    p.config.mirrorY = true;
    p.config.botSizeX = 1000;
    p.config.botSizeY = 500;
    p.plants = [p.plants[0]];
    render(<PlantInstances {...p} />);
    (useFrame as jest.Mock).mock.calls.forEach(([frameFn]) =>
      frameFn({ camera: { quaternion: new Quaternion() } }));
    const instancedRef = allRefs.find(ref => !!ref.current?.setMatrixAt);
    expect(instancedRef?.current?.setMatrixAt).toHaveBeenCalled();
    const matrix = (instancedRef?.current?.setMatrixAt as jest.Mock)
      .mock.calls[0][1];
    expect(matrix.elements[12]).toBeCloseTo(1260);
    expect(matrix.elements[13]).toBeCloseTo(460);
  });

  it("skips repeated icon matrix updates until camera changes", () => {
    const p = fakeProps();
    p.plants = [p.plants[0]];
    render(<PlantInstances {...p} />);
    const frameFn = (useFrame as jest.Mock).mock.calls[0][0];
    const instancedRef = allRefs.find(ref => !!ref.current?.setMatrixAt);
    const setMatrixAt = instancedRef?.current?.setMatrixAt as jest.Mock;
    const state = { camera: { quaternion: new Quaternion() } };
    frameFn(state);
    setMatrixAt.mockClear();
    frameFn(state);
    expect(setMatrixAt).not.toHaveBeenCalled();
    frameFn({
      camera: { quaternion: new Quaternion(0, 0, 0.1, 1).normalize() },
    });
    expect(setMatrixAt).toHaveBeenCalled();
  });

  it("reuses static icon positions when the camera changes", () => {
    let frameFn: Function | undefined;
    (useFrame as jest.Mock).mockImplementation((fn: Function) => {
      frameFn = fn;
    });
    const getZ = jest.fn(() => 0);
    const p = fakeProps();
    p.getZ = getZ;
    p.plants = [p.plants[0]];
    render(<PlantInstances {...p} />);
    const instancedRef = allRefs.find(ref => !!ref.current?.setMatrixAt);
    const setMatrixAt = instancedRef?.current?.setMatrixAt as jest.Mock;
    getZ.mockClear();
    frameFn?.({
      camera: { quaternion: new Quaternion(0, 0, 0.1, 1).normalize() },
    });
    expect(getZ).not.toHaveBeenCalled();
    expect(setMatrixAt).toHaveBeenCalled();
  });

  it("reuses static icon positions during seasonal animation", () => {
    let frameFn: Function | undefined;
    (useFrame as jest.Mock).mockImplementation((fn: Function) => {
      frameFn = fn;
    });
    const getZ = jest.fn(() => 0);
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    p.getZ = getZ;
    p.plants = [p.plants[0]];
    render(<PlantInstances {...p} />);
    const instancedRef = allRefs.find(ref => !!ref.current?.setMatrixAt);
    const setMatrixAt = instancedRef?.current?.setMatrixAt as jest.Mock;
    getZ.mockClear();
    frameFn?.({
      camera: { quaternion: new Quaternion(0, 0, 0.1, 1).normalize() },
    });
    expect(getZ).not.toHaveBeenCalled();
    expect(setMatrixAt).toHaveBeenCalled();
  });

  it.each([
    ["static seasons", false],
    ["animated seasons", true],
  ])("memoizes %s icon setup across unrelated config churn",
    (_label, animateSeasons) => {
      const getZ = jest.fn(() => 0);
      const p = fakeProps();
      p.config.animateSeasons = animateSeasons;
      p.startTimeRef = animateSeasons ? { current: 0 } : undefined;
      p.getZ = getZ;
      p.plants = [p.plants[0]];
      const { rerender } = render(<PlantInstances {...p} />);
      const frameCalls = (useFrame as jest.Mock).mock.calls.length;
      getZ.mockClear();

      rerender(<PlantInstances {...p} config={{
        ...p.config,
        heading: p.config.heading + 45,
        label: "unrelated config churn",
        sunAzimuth: p.config.sunAzimuth + 15,
      }} />);

      expect(getZ).not.toHaveBeenCalled();
      expect(useFrame).toHaveBeenCalledTimes(frameCalls);
    });

  it("updates icon setup when position config changes", () => {
    const getZ = jest.fn(() => 0);
    const p = fakeProps();
    p.getZ = getZ;
    p.plants = [p.plants[0]];
    const { rerender } = render(<PlantInstances {...p} />);
    getZ.mockClear();

    rerender(<PlantInstances {...p} config={{
      ...p.config,
      mirrorX: !p.config.mirrorX,
    }} />);

    expect(getZ).toHaveBeenCalledWith(100, 200);
  });

  it("rerenders icons when brightness config changes", () => {
    const p = fakeProps();
    p.plants = [p.plants[0]];
    const { rerender } = render(<PlantInstances {...p} />);
    const frameCalls = (useFrame as jest.Mock).mock.calls.length;

    rerender(<PlantInstances {...p} config={{
      ...p.config,
      sunInclination: p.config.sunInclination - 10,
    }} />);

    expect(useFrame).toHaveBeenCalledTimes(frameCalls + 1);
  });

  it("rerenders animated icons when the season changes", () => {
    const p = fakeProps();
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    p.plants = [p.plants[0]];
    const { rerender } = render(<PlantInstances {...p} />);
    const frameCalls = (useFrame as jest.Mock).mock.calls.length;

    rerender(<PlantInstances {...p} config={{
      ...p.config,
      plants: "Winter",
    }} />);

    expect(useFrame).toHaveBeenCalledTimes(frameCalls + 1);
  });

  it("updates material brightness when changed", () => {
    const setScalar = jest.fn();
    const instancedRef = {
      current: {
        setMatrixAt: jest.fn(),
        instanceMatrix: { needsUpdate: false },
      },
    };
    const materialRef = {
      current: { color: { setScalar } },
    };
    const lastBrightnessRef = { current: undefined as number | undefined };
    const actualUseRef = reactUseRefSpy.getMockImplementation();
    reactUseRefSpy
      .mockImplementationOnce(() =>
        instancedRef)
      .mockImplementationOnce(() =>
        materialRef)
      .mockImplementationOnce(() =>
        lastBrightnessRef)
      .mockImplementation(actualUseRef as never);
    const p = fakeProps();
    p.config.sunInclination = 0;
    p.plants = [p.plants[0]];
    render(<PlantInstances {...p} />);
    materialRef.current = { color: { setScalar } };
    (useFrame as jest.Mock).mock.calls.forEach(([frameFn]) =>
      frameFn({ camera: { quaternion: new Quaternion() } }));
    expect(setScalar).toHaveBeenCalledWith(0.5);
  });
});
