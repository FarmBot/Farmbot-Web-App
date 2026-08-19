import { objectHasSelectionOverlay } from "../resolve";

describe("selection resolution", () => {
  it("does not show an overlay without a resolved object", () => {
    expect(objectHasSelectionOverlay(undefined)).toBeFalsy();
  });
});
