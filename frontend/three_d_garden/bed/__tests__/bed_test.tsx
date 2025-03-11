jest.mock("../../../farm_designer/map/layers/plants/plant_actions", () => ({
  dropPlant: jest.fn(),
}));

let mockIsMobile = false;
jest.mock("../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

const mockSetPosition = jest.fn();
interface MockRefCurrent {
  position: { set: Function; };
}
interface MockRef {
  current: MockRefCurrent | undefined;
}
const mockRef: MockRef = { current: undefined };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: () => mockRef,
}));

import React from "react";
import { INITIAL } from "../../config";
import { Bed, BedProps } from "../bed";
import { clone } from "lodash";
import { fireEvent, render, screen } from "@testing-library/react";
import { dropPlant } from "../../../farm_designer/map/layers/plants/plant_actions";
import { Path } from "../../../internal_urls";
import { fakeAddPlantProps } from "../../../__test_support__/fake_props";
import { Actions } from "../../../constants";

describe("<Bed />", () => {
  const fakeProps = (): BedProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders bed", () => {
    const p = fakeProps();
    p.config.extraLegsX = 0;
    const { container } = render(<Bed {...p} />);
    expect(container).toContainHTML("bed-group");
  });

  it("renders bed with extra legs", () => {
    const p = fakeProps();
    p.config.extraLegsX = 2;
    p.config.extraLegsY = 2;
    p.config.legsFlush = false;
    const { container } = render(<Bed {...p} />);
    expect(container).toContainHTML("bed-group");
  });

  it("adds a plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(dropPlant).toHaveBeenCalledWith(expect.objectContaining({
      gardenCoords: { x: 1360, y: 660 },
    }));
  });

  it("adds a drawn point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps([]);
    addPlantProps.designer.drawnPoint = {
      cx: 1, cy: 2, z: 3, r: 150, color: "green",
    };
    p.addPlantProps = addPlantProps;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: 1360, cy: 660, r: 150 },
    });
  });

  it("adds a drawn weed", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    mockIsMobile = false;
    mockRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps([]);
    addPlantProps.designer.drawnWeed = {
      cx: 1, cy: 2, z: 3, r: 25, color: "red",
    };
    p.addPlantProps = addPlantProps;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_WEED_DATA,
      payload: { cx: 1360, cy: 660, r: 25 },
    });
  });

  it("updates pointer plant position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    mockRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).toHaveBeenCalledWith(0, 0, 0);
  });

  it("handles missing ref", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    mockRef.current = undefined;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
  });

  it("doesn't update pointer plant position: mobile", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = true;
    mockRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
  });
});
