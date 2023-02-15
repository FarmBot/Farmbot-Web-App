import { NULL_CHOICE } from "../fb_select";

describe("NULL_CHOICE", () => {
  it("returns null choice", () => {
    expect(NULL_CHOICE).toEqual({ label: "None", value: "", isNull: true });
  });
});
