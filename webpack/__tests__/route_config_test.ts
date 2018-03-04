jest.mock("fastclick", () => ({ attach: jest.fn() }));

import { topLevelRoutes } from "../route_config";

describe("route configs", () => {
  it("generates all of them", async () => {
    const cb = jest.fn();
    const routes = topLevelRoutes.childRoutes;
    const results = await Promise.all(routes.map(route => route.getComponent(undefined, cb)));
    expect(cb).toHaveBeenCalled();
    expect(cb).toHaveBeenCalledTimes(routes.length);
    cb.mock.calls.map(x => expect(!!x[1]).toBeTruthy());
  });
});
