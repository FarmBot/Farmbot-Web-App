jest.mock("../../../farm_designer/map/layers/plants/plant_actions", () => ({
  dropPlant: jest.fn(),
}));

let mockIsMobile = false;
jest.mock("../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

const mockSetPosition = jest.fn();
const mockSetScale = jest.fn();
interface MockPlantRefCurrent {
  position: { set: Function; };
}
interface MockRadiusRefCurrent {
  scale: { set: Function; };
}
interface MockPlantRef {
  current: MockPlantRefCurrent | undefined;
}
interface MockRadiusRef {
  current: MockRadiusRefCurrent | undefined;
}
const mockPlantRef: MockPlantRef = { current: undefined };
const mockRadiusRef: MockRadiusRef = { current: undefined };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(),
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
import { fakeDrawnPoint } from "../../../__test_support__/fake_designer_state";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";

describe("<Bed />", () => {
  beforeEach(() => {
    React.useRef = jest.fn()
      .mockImplementationOnce(() => mockPlantRef)
      .mockImplementationOnce(() => mockRadiusRef);
  });

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

  it("doesn't add a drawn point", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps([]);
    addPlantProps.designer.drawnPoint = undefined;
    p.addPlantProps = addPlantProps;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).not.toHaveBeenCalled();
  });

  it("adds a drawn point: xy", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps([]);
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    addPlantProps.designer.drawnPoint = point;
    p.addPlantProps = addPlantProps;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...point, cx: 1360, cy: 660, z: -500 },
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledTimes(1);
  });

  it("adds a drawn point: radius", () => {
    location.pathname = Path.mock(Path.points("add"));
    const p = fakeProps();
    const addPlantProps = fakeAddPlantProps([]);
    const dispatch = jest.fn();
    addPlantProps.dispatch = mockDispatch(dispatch);
    const point = fakeDrawnPoint();
    point.cx = 10;
    point.cy = 20;
    addPlantProps.designer.drawnPoint = point;
    p.addPlantProps = addPlantProps;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.click(soil);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...point, r: 1490 },
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined,
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledTimes(3);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.any(Object),
    });
  });

  it("updates pointer plant position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPosition } };
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
    mockPlantRef.current = undefined;
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
    mockPlantRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
  });

  it("doesn't update pointer point position", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    p.addPlantProps.designer.drawnPoint = undefined;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
  });

  it("updates pointer point position", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).toHaveBeenCalledWith(0, 0, 0);
  });

  it("updates pointer point radius", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPosition } };
    mockRadiusRef.current = { scale: { set: mockSetScale } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
    expect(mockSetScale).toHaveBeenCalledWith(1510, 1, 1510);
  });

  it("updates pointer weed radius", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPosition } };
    mockRadiusRef.current = { scale: { set: mockSetScale } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
    expect(mockSetScale).toHaveBeenCalledWith(1510, 1510, 1510);
  });

  it("doesn't update pointer point radius", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPosition } };
    mockRadiusRef.current = undefined;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPosition).not.toHaveBeenCalled();
    expect(mockSetScale).not.toHaveBeenCalled();
  });
});
