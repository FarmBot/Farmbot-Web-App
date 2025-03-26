jest.mock("../../../../farm_designer/map/layers/plants/plant_actions", () => ({
  dropPlant: jest.fn(),
}));

let mockIsMobile = false;
jest.mock("../../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

import React from "react";
import {
  PointerObjects, PointerObjectsProps,
  soilClick, SoilClickProps,
  soilPointerMove, SoilPointerMoveProps,
} from "../pointer_objects";
import { render } from "@testing-library/react";
import { INITIAL } from "../../../config";
import { fakeAddPlantProps } from "../../../../__test_support__/fake_props";
import { clone } from "lodash";
import { Path } from "../../../../internal_urls";
import { Group, Mesh, Vector3 } from "three";
import { Line2 } from "three/examples/jsm/Addons";
import { ThreeEvent } from "@react-three/fiber";
import {
  dropPlant,
} from "../../../../farm_designer/map/layers/plants/plant_actions";

describe("<PointerObjects />", () => {
  const fakeProps = (): PointerObjectsProps => ({
    config: clone(INITIAL),
    mapPoints: [],
    addPlantProps: fakeAddPlantProps([]),
    pointerPlantRef: { current: { position: new Vector3(0, 0, 0) } as Group },
    radiusRef: { current: { scale: new Vector3(0, 0, 0) } as Group },
    billboardRef: { current: { position: new Vector3(0, 0, 0) } as Group },
    imageRef: { current: { scale: new Vector3(0, 0, 0) } as Mesh },
    xCrosshairRef: { current: { position: new Vector3(0, 0, 0) } as Line2 },
    yCrosshairRef: { current: { position: new Vector3(0, 0, 0) } as Line2 },
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const { container } = render(<PointerObjects {...fakeProps()} />);
    expect(container).toContainHTML("mint");
  });
});

describe("soilClick()", () => {
  const fakeProps = (): SoilClickProps => ({
    config: clone(INITIAL),
    navigate: jest.fn(),
    addPlantProps: fakeAddPlantProps([]),
    pointerPlantRef: { current: { position: new Vector3(0, 0, 0) } as Group },
  });

  it("creates plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 1, y: 2 },
    } as unknown as ThreeEvent<MouseEvent>;
    soilClick(p)(e);
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(dropPlant).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 1360, y: 660 },
    }));
  });
});

describe("soilPointerMove()", () => {
  const fakeProps = (): SoilPointerMoveProps => ({
    config: clone(INITIAL),
    addPlantProps: fakeAddPlantProps([]),
    pointerPlantRef: { current: { position: { set: jest.fn() } } as unknown as Group },
    radiusRef: { current: { scale: { set: jest.fn() } } as unknown as Group },
    billboardRef: { current: { position: { set: jest.fn() } } as unknown as Group },
    imageRef: { current: { scale: { set: jest.fn() } } as unknown as Mesh },
    xCrosshairRef: { current: { position: { set: jest.fn() } } as unknown as Line2 },
    yCrosshairRef: { current: { position: { set: jest.fn() } } as unknown as Line2 },
  });

  it("updates plant position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    const p = fakeProps();
    const e = {
      stopPropagation: jest.fn(),
      point: { x: 100, y: 200 },
    } as unknown as ThreeEvent<MouseEvent>;
    soilPointerMove(p)(e);
    expect(p.pointerPlantRef.current?.position.set)
      .toHaveBeenCalledWith(100, 200, 0);
  });
});
