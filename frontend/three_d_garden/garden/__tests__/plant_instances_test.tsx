interface MockRef {
  current: {
    scale: { set: Function; };
    position: { z: number; };
    setMatrixAt?: Function;
    instanceMatrix?: { needsUpdate: boolean };
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
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRefImpl(),
}));

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { clone } from "lodash";
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

afterAll(() => {
  jest.unmock("react");
});
describe("<PlantInstances />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
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
});
