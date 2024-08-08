import { PLANTS } from "../constants";

describe("PLANTS", () => {
  it("returns data", () => {
    expect(PLANTS.anaheimPepper.size).toEqual(150);
  });
});
