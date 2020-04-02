import {
  startNewPoint, resizePoint, StartNewPointProps, ResizePointProps,
} from "../drawn_point_actions";
import { Actions } from "../../../../constants";

describe("startNewPoint", () => {
  const fakeProps = (): StartNewPointProps => ({
    gardenCoords: { x: 100, y: 200 },
    dispatch: jest.fn(),
    setMapState: jest.fn(),
    type: "point",
  });

  it("starts point", () => {
    const p = fakeProps();
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: 100, cy: 200, r: 0 }
    });
  });

  it("starts weed", () => {
    const p = fakeProps();
    p.type = "weed";
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_WEED_DATA,
      payload: { cx: 100, cy: 200, r: 0 }
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
    drawnPoint: { cx: 100, cy: 200, r: 0 },
    dispatch: jest.fn(),
    isDragging: true,
    type: "point",
  });

  it("resizes point", () => {
    const p = fakeProps();
    resizePoint(p);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: { cx: 100, cy: 200, r: 0 }
    });
  });

  it("resizes weed", () => {
    const p = fakeProps();
    p.type = "weed";
    resizePoint(p);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_WEED_DATA,
      payload: { cx: 100, cy: 200, r: 0 }
    });
  });

  it("doesn't resize point", () => {
    const p = fakeProps();
    p.isDragging = false;
    resizePoint(p);
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});
