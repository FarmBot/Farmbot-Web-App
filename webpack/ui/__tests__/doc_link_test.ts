import { docLink, BASE_URL } from "../doc_link";

describe("docLink", () => {
  it("creates doc links", () => {
    expect(docLink()).toEqual(BASE_URL);
    expect(docLink("farmware")).toEqual(BASE_URL + "farmware");
  });
});
