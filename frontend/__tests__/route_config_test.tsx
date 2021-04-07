jest.mock("react-redux", () => ({
  connect: jest.fn(() => jest.fn(x => x)),
}));

import { UNBOUND_ROUTES } from "../route_config";
import { RouteEnterEvent } from "takeme";
import { ChangeRoute } from "../routes";

const fakeChangeRoute: ChangeRoute = (component, info, child) => {
  if (info?.$ == "*") {
    expect(component.name).toEqual("FourOhFour");
  }
  expect(component?.name.split("Raw").join("")).toEqual(info?.key);
  if (info?.children) {
    expect(child?.name.split("Raw").join("")).toEqual(info?.childKey);
  }
};

const fakeRouteEnterEvent: RouteEnterEvent = {
  params: { splat: "????" },
  oldPath: "??",
  newPath: "??"
};

describe("UNBOUND_ROUTES", () => {
  it("generates correct routes", () => {
    UNBOUND_ROUTES
      .map(r => r(fakeChangeRoute))
      .map(r => r.enter && r.enter(fakeRouteEnterEvent));
  });

  it("generates crash route", async () => {
    console.error = jest.fn();
    const fakeError = new Error("fake callback error");
    const changeRouteError = jest.fn()
      // try block call
      .mockImplementationOnce(() => { throw fakeError; })
      // catch block call
      .mockImplementationOnce(x => { expect(x.name).toEqual("Apology"); });
    const r = UNBOUND_ROUTES[0](changeRouteError);
    r.enter && await r.enter(fakeRouteEnterEvent);
    expect(console.error).toHaveBeenCalledWith(fakeError);
  });
});
