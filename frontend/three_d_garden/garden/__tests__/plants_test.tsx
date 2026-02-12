import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { clone } from "lodash";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { INITIAL } from "../../config";
import {
  PlantSpreadInstances,
  PlantSpreadInstancesProps,
  ThreeDPlantLabel,
  ThreeDPlantLabelProps,
  outOfBoundsShaderModification,
} from "../plants";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { convertPlants } from "../../../farm_designer/three_d_garden_map";
import { setMockInstanceId } from "../../../__test_support__/three_d_mocks";
import { useFrame } from "@react-three/fiber";
import { Quaternion, WebGLProgramParametersWithUniforms } from "three";
import { Mode } from "../../../farm_designer/map/interfaces";
import * as mapUtil from "../../../farm_designer/map/util";

interface MockRef {
  current: {
    setMatrixAt?: Function;
    setColorAt?: Function;
    instanceMatrix?: { needsUpdate: boolean };
    instanceColor?: { needsUpdate: boolean; count?: number };
    geometry?: { setAttribute: Function; getAttribute: Function };
    material?: { needsUpdate: boolean } | { needsUpdate: boolean }[];
  } | undefined;
}
let mockRefImpl = (): MockRef => ({ current: undefined });
let refQueue: MockRef[] = [];
let allRefs: MockRef[] = [];
let allowImperativeHandle = true;
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => {
    const nextRef = refQueue.shift() || mockRefImpl();
    allRefs.push(nextRef);
    return nextRef;
  },
  useImperativeHandle: (ref: unknown, init: Function) =>
    allowImperativeHandle
      ? jest.requireActual("react").useImperativeHandle(ref, init)
      : undefined,
}));

let getModeSpy: jest.SpyInstance;

const buildMeshRef = (): MockRef["current"] => ({
  setMatrixAt: jest.fn(),
  setColorAt: jest.fn(),
  instanceMatrix: { needsUpdate: false },
  instanceColor: { needsUpdate: false, count: 0 },
  geometry: {
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
  },
  material: [{ needsUpdate: false }],
});

const getMeshRef = () =>
  allRefs.find(ref => !!ref.current?.setMatrixAt);

const queueMeshRef = (override?: Partial<MockRef["current"]>) => {
  refQueue = Array.from({ length: 10 }, () => ({
    current: {
      ...buildMeshRef(),
      ...override,
    },
  }));
};

describe("<ThreeDPlantLabel />", () => {
  afterEach(cleanup);

  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
    refQueue = [{ current: undefined }];
    allRefs = [];
    mockRefImpl = () => ({ current: undefined });
  });

  const fakeProps = (): ThreeDPlantLabelProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    plant.body.id = 1;
    const otherPlant = fakePlant();
    otherPlant.body.id = 2;
    return {
      plant: convertPlants(config, [plant])[0],
      i: 0,
      config: config,
      hoveredPlant: undefined,
      getZ: () => 0,
    };
  };

  it("renders label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = false;
    render(<ThreeDPlantLabel {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders hovered label", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.hoveredPlant = 0;
    render(<ThreeDPlantLabel {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });
});

describe("<ThreeDPlantSpread />", () => {
  afterEach(cleanup);

  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
    (useFrame as jest.Mock).mockClear();
    refQueue = [];
    allRefs = [];
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
    mockRefImpl = () => ({ current: undefined });
  });

  afterEach(() => {
    getModeSpy?.mockRestore();
  });

  const fakeProps = (): PlantSpreadInstancesProps => {
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
      visible: true,
      getZ: () => 0,
      activePositionRef: { current: { x: 0, y: 0 } },
      spreadVisible: false,
    };
  };

  it("renders spread", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    queueMeshRef();
    const p = fakeProps();
    p.spreadVisible = true;
    const { container } = render(<PlantSpreadInstances {...p} />);
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
  });

  it("renders spread: edit plant mode", () => {
    location.pathname = Path.mock(Path.plants("1"));
    queueMeshRef();
    const p = fakeProps();
    p.spreadVisible = false;
    const { container } = render(<PlantSpreadInstances {...p} />);
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
  });

  it("renders spread: edit plant mode without plant", () => {
    location.pathname = Path.mock(Path.plants("999999"));
    queueMeshRef();
    const p = fakeProps();
    p.spreadVisible = false;
    const { container } = render(<PlantSpreadInstances {...p} />);
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
  });

  it("handles click on spread part", () => {
    setMockInstanceId(0);
    queueMeshRef();
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantSpreadInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 0 });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("1"));
  });

  it("updates instance colors on frame", () => {
    let mesh:
      (MockRef["current"] & { geometry: { setAttribute: Function } }) | undefined;
    const imperativeHandleSpy = jest
      .spyOn(React, "useImperativeHandle")
      .mockImplementation((ref: { current?: unknown }, init: Function) => {
        const value = init() as MockRef["current"];
        if (value) {
          value.instanceColor = { needsUpdate: false, count: 0 };
          value.geometry = {
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
          };
        }
        ref.current = value;
        mesh = value as typeof mesh;
      });
    const p = fakeProps();
    p.visible = true;
    getModeSpy.mockReturnValue(Mode.none);
    render(<PlantSpreadInstances {...p} />);
    const frameFn = (useFrame as jest.Mock).mock.calls[0][0];
    frameFn({ camera: { quaternion: new Quaternion() } });
    imperativeHandleSpy.mockRestore();
    expect(mesh).toBeDefined();
    expect(mesh?.setMatrixAt).toHaveBeenCalled();
    expect(mesh?.geometry?.setAttribute).toHaveBeenCalled();
  });

  it("skips frame updates when invisible", () => {
    queueMeshRef();
    const p = fakeProps();
    p.visible = false;
    render(<PlantSpreadInstances {...p} />);
    const frameFn = (useFrame as jest.Mock).mock.calls[0][0];
    frameFn({ camera: { quaternion: new Quaternion() } });
    const meshRef = getMeshRef();
    expect(meshRef?.current?.instanceMatrix?.needsUpdate).toBeFalsy();
  });

  it("handles missing mesh in layout effect", () => {
    const actualReact = jest.requireActual("react");
    const imperativeHandleSpy = jest
      .spyOn(actualReact, "useImperativeHandle")
      .mockImplementation(() => { });
    const useRefSpy = jest
      .spyOn(React, "useRef")
      .mockImplementation(() => ({ current: undefined }));
    allowImperativeHandle = false;
    const p = fakeProps();
    render(<PlantSpreadInstances {...p} />);
    imperativeHandleSpy.mockRestore();
    useRefSpy.mockRestore();
    allowImperativeHandle = true;
    const meshRef = getMeshRef();
    expect(meshRef?.current).toBeUndefined();
  });

  it("uses material object branch", () => {
    let mesh:
      (MockRef["current"] & { material: { needsUpdate: boolean } }) | undefined;
    const imperativeHandleSpy = jest
      .spyOn(React, "useImperativeHandle")
      .mockImplementation((ref: { current?: unknown }, init: Function) => {
        const value = init() as MockRef["current"];
        if (value) {
          value.material = { needsUpdate: false };
        }
        ref.current = value;
        mesh = value as typeof mesh;
      });
    const p = fakeProps();
    p.activePositionRef =
      { current: undefined as unknown as { x: number; y: number } };
    location.pathname = Path.mock(Path.plants("1"));
    render(<PlantSpreadInstances {...p} />);
    const frameFn = (useFrame as jest.Mock).mock.calls[0][0];
    frameFn({ camera: { quaternion: new Quaternion() } });
    imperativeHandleSpy.mockRestore();
    expect(mesh).toBeDefined();
    const material = mesh?.material as { needsUpdate: boolean };
    expect(material.needsUpdate).toBe(true);
  });

  it("handles click with missing instance id", () => {
    setMockInstanceId(undefined);
    queueMeshRef();
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantSpreadInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: undefined });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("skips click when plant id missing", () => {
    setMockInstanceId(0);
    queueMeshRef();
    const p = fakeProps();
    p.plants[0].id = undefined as unknown as number;
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantSpreadInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 0 });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("skips click when plant is missing", () => {
    setMockInstanceId(99);
    queueMeshRef();
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    const { container } = render(<PlantSpreadInstances {...p} />);
    const mesh = container.querySelector("instancedmesh");
    mesh && fireEvent.click(mesh, { instanceId: 99 });
    expect(dispatch).not.toHaveBeenCalled();
  });
});

describe("outOfBoundsShaderModification", () => {
  it("uses uInside when instance colors are off", () => {
    const shader = {
      vertexShader: [
        "#include <common>",
        "#include <color_vertex>",
        "#include <worldpos_vertex>",
      ].join("\n"),
      fragmentShader: [
        "#include <common>",
        "#include <color_fragment>",
      ].join("\n"),
      uniforms: {},
    } as unknown as WebGLProgramParametersWithUniforms;
    outOfBoundsShaderModification(shader, false);
    expect(shader.fragmentShader).toContain("uInside");
    expect(shader.vertexShader).not.toContain("vInstanceColor");
  });
});
