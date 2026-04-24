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
import { clone } from "lodash";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Quaternion } from "three";
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

  it("doesn't build per-plant mesh keys while rendering", () => {
    const keySpy = jest.spyOn(meshKey, "instancedMeshKey");
    render(<PlantInstances {...fakeProps()} />);
    expect(keySpy).not.toHaveBeenCalled();
    keySpy.mockRestore();
  });

  it("loads the atlas texture when an icon is mapped", () => {
    PLANT_ICON_ATLAS["/crops/icons/beet.avif"] = {
      atlasUrl: "/crops/icons/atlas.avif",
      textureWidth: 256,
      textureHeight: 256,
      x: 0,
      y: 0,
      width: 64,
      height: 64,
    };
    render(<PlantInstances {...fakeProps()} />);
    expect(useTexture).toHaveBeenCalledWith("/crops/icons/atlas.avif");
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
