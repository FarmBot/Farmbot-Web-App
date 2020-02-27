import { Plant } from "../plant";

describe("Plant()", () => {
  it("returns defaults", () => {
    expect(Plant({})).toEqual({
      created_at: "",
      id: undefined,
      meta: {},
      name: "Untitled Plant",
      openfarm_slug: "not-set",
      plant_stage: "planned",
      pointer_type: "Plant",
      radius: 25,
      x: 0,
      y: 0,
      z: 0,
    });
  });
});
