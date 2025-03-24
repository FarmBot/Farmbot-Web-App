jest.mock("../../../farm_designer/map/layers/plants/plant_actions", () => ({
  dropPlant: jest.fn(),
}));

let mockIsMobile = false;
jest.mock("../../../screen_size", () => ({
  isMobile: () => mockIsMobile,
}));

const mockSetPlantPosition = jest.fn();
const mockSetRadiusScale = jest.fn();
const mockSetBillboardPosition = jest.fn();
const mockSetImageScale = jest.fn();
interface MockPlantRefCurrent {
  position: { set: Function; };
}
interface MockRadiusRefCurrent {
  scale: { set: Function; };
}
interface MockBillboardRefCurrent {
  position: { set: Function; };
}
interface MockImageRefCurrent {
  scale: { set: Function; };
}
interface MockPlantRef {
  current: MockPlantRefCurrent | undefined;
}
interface MockRadiusRef {
  current: MockRadiusRefCurrent | undefined;
}
interface MockBillboardRef {
  current: MockBillboardRefCurrent | undefined;
}
interface MockImageRef {
  current: MockImageRefCurrent | undefined;
}
const mockPlantRef: MockPlantRef = { current: undefined };
const mockRadiusRef: MockRadiusRef = { current: undefined };
const mockBillboardRef: MockBillboardRef = { current: undefined };
const mockImageRef: MockImageRef = { current: undefined };
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
import { fakePoint } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus } from "farmbot";

describe("<Bed />", () => {
  beforeEach(() => {
    React.useRef = jest.fn()
      .mockImplementationOnce(() => mockPlantRef)
      .mockImplementationOnce(() => mockRadiusRef)
      .mockImplementationOnce(() => mockBillboardRef)
      .mockImplementationOnce(() => mockImageRef);
  });

  const fakeProps = (): BedProps => ({
    config: clone(INITIAL),
    activeFocus: "",
    mapPoints: [],
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

  it.each<[string, SpecialStatus]>([
    ["doesn't render", SpecialStatus.DIRTY],
    ["renders", SpecialStatus.SAVED],
  ])("%s pointer point", (title, gridPointSpecialStatus) => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    const point0 = fakePoint();
    point0.specialStatus = gridPointSpecialStatus;
    point0.body.meta = { gridId: "123" };
    p.mapPoints = [point0];
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    point.r = 0;
    p.addPlantProps.designer.drawnPoint = point;
    const { container } = render(<Bed {...p} />);
    if (title == "renders") {
      expect(container).toContainHTML("drawn-point");
    } else {
      expect(container).not.toContainHTML("drawn-point");
    }
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
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
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
    expect(mockSetPlantPosition).toHaveBeenCalledWith(0, 0, 0);
    expect(p.addPlantProps.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...point, cx: 1360, cy: 660, z: -500 },
    });
    expect(p.addPlantProps.dispatch).toHaveBeenCalledTimes(1);
  });

  it("adds a drawn point: radius", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
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
    expect(mockSetPlantPosition).toHaveBeenCalledWith(0, 0, 0);
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
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).toHaveBeenCalledWith(0, 0, 0);
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
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
  });

  it("doesn't update pointer plant position: mobile", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    mockIsMobile = true;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
  });

  it("doesn't update pointer point position", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    p.addPlantProps.designer.drawnPoint = undefined;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
  });

  it("updates pointer point position", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
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
    expect(mockSetPlantPosition).toHaveBeenCalledWith(0, 0, 0);
  });

  it("updates pointer point radius", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = { scale: { set: mockSetRadiusScale } };
    mockBillboardRef.current = { position: { set: mockSetBillboardPosition } };
    mockImageRef.current = { scale: { set: mockSetImageScale } };
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
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).toHaveBeenCalledWith(1510, 1, 1510);
    expect(mockSetBillboardPosition).toHaveBeenCalledWith(0, 0, 755);
    expect(mockSetImageScale).toHaveBeenCalledWith(1510, 1510, 1510);
  });

  it("updates pointer weed radius", () => {
    location.pathname = Path.mock(Path.weeds("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = { scale: { set: mockSetRadiusScale } };
    mockBillboardRef.current = { position: { set: mockSetBillboardPosition } };
    mockImageRef.current = { scale: { set: mockSetImageScale } };
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
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).toHaveBeenCalledWith(1510, 1510, 1510);
    expect(mockSetBillboardPosition).toHaveBeenCalledWith(0, 0, 755);
    expect(mockSetImageScale).toHaveBeenCalledWith(1510, 1510, 1510);
  });

  it("doesn't update pointer point radius: no ref", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = undefined;
    mockBillboardRef.current = undefined;
    mockImageRef.current = undefined;
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
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).not.toHaveBeenCalled();
    expect(mockSetBillboardPosition).not.toHaveBeenCalled();
    expect(mockSetImageScale).not.toHaveBeenCalled();
  });

  it("doesn't update pointer point radius: already set", () => {
    location.pathname = Path.mock(Path.points("add"));
    mockIsMobile = false;
    mockPlantRef.current = { position: { set: mockSetPlantPosition } };
    mockRadiusRef.current = { scale: { set: mockSetRadiusScale } };
    mockBillboardRef.current = { position: { set: mockSetBillboardPosition } };
    mockImageRef.current = { scale: { set: mockSetImageScale } };
    const p = fakeProps();
    p.addPlantProps = fakeAddPlantProps([]);
    const point = fakeDrawnPoint();
    point.cx = 1;
    point.cy = 1;
    point.r = 100;
    p.addPlantProps.designer.drawnPoint = point;
    render(<Bed {...p} />);
    const soil = screen.getAllByText("soil")[0];
    fireEvent.pointerMove(soil);
    expect(mockSetPlantPosition).not.toHaveBeenCalled();
    expect(mockSetRadiusScale).not.toHaveBeenCalled();
    expect(mockSetBillboardPosition).not.toHaveBeenCalled();
    expect(mockSetImageScale).not.toHaveBeenCalled();
  });
});
