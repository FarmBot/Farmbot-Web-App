import { startNewPoint, resizePoint } from "../drawn_point_actions";
import { Actions } from "../../../../constants";

describe("startNewPoint", () => {
  const fakeProps = () => ({
    gardenCoords: { x: 100, y: 200 },
    dispatch: jest.fn(),
    setMapState: jest.fn(),
  });

  it("starts point", () => {
    const p = fakeProps();
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: { cx: 100, cy: 200, r: 0 }
    });
  });

  it("doesn't start point", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.gardenCoords = undefined as any;
    startNewPoint(p);
    expect(p.setMapState).toHaveBeenCalledWith({ isDragging: true });
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});

describe("resizePoint", () => {
  const fakeProps = () => ({
    gardenCoords: { x: 100, y: 200 },
    currentPoint: { cx: 100, cy: 200, r: 0 },
    dispatch: jest.fn(),
    isDragging: true,
  });

  it("resizes point", () => {
    const p = fakeProps();
    resizePoint(p);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CURRENT_POINT_DATA,
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
