import { urlFriendly } from "../urls";

describe("urlFriendly()", () => {
  it("returns converted url", () => {
    expect(urlFriendly("A url")).toEqual("a_url");
  });
});
