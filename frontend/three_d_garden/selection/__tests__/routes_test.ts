import { selectionKindAllowed } from "../routes";

describe("selection routes", () => {
  it("defaults selection filtering to plants", () => {
    expect(selectionKindAllowed("plant", undefined)).toBeTruthy();
    expect(selectionKindAllowed("weed", undefined)).toBeFalsy();
  });
});
