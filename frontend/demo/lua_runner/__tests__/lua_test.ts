import { LUA_HELPERS } from "../lua";

describe("LUA_HELPERS", () => {
  it("returns lua code", () => {
    expect(LUA_HELPERS.length).toBeGreaterThan(100);
  });
});
