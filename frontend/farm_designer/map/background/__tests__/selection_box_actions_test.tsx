import { fakePlant } from "../../../../__test_support__/fake_state/resources";
import {
  getSelected, resizeBox, startNewSelectionBox
} from "../selection_box_actions";
import { Actions } from "../../../../constants";

describe("getSelected", () => {
  it("returns some", () => {
    const result = getSelected(
      [fakePlant(), fakePlant()],
      { x0: 0, y0: 0, x1: 2000, y1: 2000 });
    expect(result).toEqual([
      expect.stringContaining("Point"),
      expect.stringContaining("Point"),
    ]);
  });

  it("returns none", () => {
    const result = getSelected(
      [fakePlant(), fakePlant()],
      undefined);
    expect(result).toEqual(undefined);
  });
});

describe("resizeBox", () => {
  const fakeProps = () => ({
    selectionBox: { x0: 0, y0: 0, x1: undefined, y1: undefined },
    plants: [],
    gardenCoords: { x: 100, y: 200 },
    setMapState: jest.fn(),
    dispatch: jest.fn(),
  });

  it("resizes selection box", () => {
    const p = fakeProps();
    resizeBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 0, y0: 0, x1: 100, y1: 200 }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_PLANT,
      payload: undefined
    });
  });

  it("doesn't resize box: no location", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.gardenCoords = undefined as any;
    resizeBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("doesn't resize box: no box", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.selectionBox = undefined as any;
    resizeBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});

describe("startNewSelectionBox", () => {
  const fakeProps = () => ({
    gardenCoords: { x: 100, y: 200 },
    setMapState: jest.fn(),
    dispatch: jest.fn(),
  });

  it("starts selection box", () => {
    const p = fakeProps();
    startNewSelectionBox(p);
    expect(p.setMapState).toHaveBeenCalledWith({
      selectionBox: { x0: 100, y0: 200, x1: undefined, y1: undefined }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_PLANT,
      payload: undefined
    });
  });

  it("doesn't start box", () => {
    const p = fakeProps();
    // tslint:disable-next-line:no-any
    p.gardenCoords = undefined as any;
    startNewSelectionBox(p);
    expect(p.setMapState).not.toHaveBeenCalled();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_PLANT,
      payload: undefined
    });
  });
});
