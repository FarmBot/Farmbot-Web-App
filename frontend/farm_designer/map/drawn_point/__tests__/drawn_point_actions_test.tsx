import {
  startNewPoint, resizePoint, StartNewPointProps, ResizePointProps,
} from "../drawn_point_actions";
import { Actions } from "../../../../constants";
import {
  fakeDrawnPoint,
} from "../../../../__test_support__/fake_designer_state";

describe("startNewPoint", () => {
  const fakeProps = (): StartNewPointProps => ({
    gardenCoords: { x: 100, y: 200 },
    dispatch: jest.fn(),
    setMapState: jest.fn(),
    drawnPoint: fakeDrawnPoint(),
  });

  it("starts point", () => {
    const p = fakeProps();
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...fakeDrawnPoint(), cx: 100, cy: 200, r: 0 }
    });
  });

  it("starts weed", () => {
    const p = fakeProps();
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...fakeDrawnPoint(), cx: 100, cy: 200, r: 0 }
    });
  });

  it("doesn't start point", () => {
    const p = fakeProps();
    p.gardenCoords = undefined;
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});

describe("resizePoint", () => {
  const fakeProps = (): ResizePointProps => ({
    gardenCoords: { x: 100, y: 200 },
    drawnPoint: fakeDrawnPoint(),
    dispatch: jest.fn(),
    isDragging: true,
  });

  it("resizes point", () => {
    const p = fakeProps();
    resizePoint(p);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { ...fakeDrawnPoint(), r: 201 }
    });
  });

  it("doesn't resize point: not dragging", () => {
    const p = fakeProps();
    p.isDragging = false;
    resizePoint(p);
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't resize point: no center", () => {
    const p = fakeProps();
    const point = fakeDrawnPoint();
    point.cx = undefined;
    point.cy = undefined;
    p.drawnPoint = point;
    resizePoint(p);
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});
