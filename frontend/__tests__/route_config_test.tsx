jest.mock("react", () => ({
  ...jest.requireActual("react"),
  lazy: jest.fn(x => x()),
}));

import { last } from "lodash";
import { ROUTE_DATA } from "../route_config";

describe("ROUTE_DATA", () => {
  it("has 404", () => {
    const lastRoute = last(ROUTE_DATA);
    if (lastRoute) {
      expect(lastRoute.path).toEqual("*");
    }
  });
});
