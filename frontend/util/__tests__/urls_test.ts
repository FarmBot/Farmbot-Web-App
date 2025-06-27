import { getUrlQuery, urlFriendly } from "../urls";

describe("urlFriendly()", () => {
  it("returns converted url", () => {
    expect(urlFriendly("A url")).toEqual("A_url");
  });
});

describe("getUrlQuery()", () => {
  it("returns the first query value", () => {
    location.search = "?one=value1&two=value2";
    expect(getUrlQuery("one")).toEqual("value1");
  });

  it("returns the second query value", () => {
    location.search = "?one=value1&two=value2";
    expect(getUrlQuery("two")).toEqual("value2");
  });

  it("handles missing values", () => {
    location.search = "?key=";
    expect(getUrlQuery("key")).toEqual(undefined);
  });

  it("strips extra content", () => {
    location.search = "?key=value#other";
    expect(getUrlQuery("key")).toEqual("value");
  });
});
