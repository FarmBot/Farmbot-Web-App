import { ResolvedThreeDObject } from "../resolve";
import { scaledObjectPopupPosition } from "../popups";

describe("selection popups", () => {
  it("keeps non-scene-object popup positions unchanged", () => {
    const object = {
      kind: "camera",
      popupPosition: [1, 2, 3],
    } as unknown as ResolvedThreeDObject;

    expect(scaledObjectPopupPosition(object, 2)).toEqual([1, 2, 3]);
  });
});
