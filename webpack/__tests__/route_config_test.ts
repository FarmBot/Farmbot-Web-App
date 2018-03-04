jest.mock("fastclick", () => ({ attach: jest.fn() }));

import { topLevelRoutes } from "../route_config";

const cb = jest.fn(() => {
  console.log("TADA!");
});

describe("route configs", () => {
  it("generates all of them", async () => {
    const routes = topLevelRoutes.childRoutes;
    const results = await Promise.all(routes.map(route => route.getComponent(undefined, cb)));
    console.log("IMPROVE THESE TESTS THEY ARE NOT GOOD RIGHT NOW");
    expect(cb).toHaveBeenCalled();
  });
});
