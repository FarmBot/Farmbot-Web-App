jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { foo: "bar" } })),
}));

jest.mock("../../api/api", () => ({
  API: { current: { globalBulletinPath: "/api/stub" } }
}));

import { fetchBulletinContent } from "../actions";

describe("fetchBulletinContent()", () => {
  it("fetches data", async () => {
    expect(await fetchBulletinContent("slug")).toEqual({ foo: "bar" });
  });
});
