import { safeEveryPointType } from "../sequences/locals_list/location_form_list";

describe("safeEveryPointType", () => {
  it("crashes on unknown values", () => {
    const boom = () => safeEveryPointType("nope");
    expect(boom).toThrowError("'nope' is not of type EveryPointType");
  });
});
