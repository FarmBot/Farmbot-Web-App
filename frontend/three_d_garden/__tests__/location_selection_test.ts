import {
  completeMapSelection, locationSelectionActive, requestMapSelection,
} from "../location_selection";

describe("map location selection", () => {
  it("completes and cancels selection requests", () => {
    const firstHandler = jest.fn();
    const firstCancel = jest.fn();
    const cancelFirst = requestMapSelection(firstHandler, firstCancel);
    expect(locationSelectionActive()).toBeTruthy();

    const secondHandler = jest.fn();
    const cancelSecond = requestMapSelection(secondHandler, jest.fn());
    expect(firstCancel).toHaveBeenCalled();
    cancelFirst();

    const result = {
      selection: { kind: "location" as const, x: 1, y: 2, z: 3 },
      coordinate: { x: 1, y: 2, z: 3 },
    };
    expect(completeMapSelection(result)).toBeTruthy();
    expect(secondHandler).toHaveBeenCalledWith(result);
    expect(locationSelectionActive()).toBeFalsy();

    cancelSecond();
    expect(completeMapSelection(result)).toBeFalsy();
  });
});
