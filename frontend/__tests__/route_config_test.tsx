jest.mock("react-router-dom", () => ({
  Route: jest.fn(({ render }) => {
    render();
    return null;
  }),
}));

import { UNBOUND_ROUTES } from "../route_config";
import { ChangeRoute } from "../routes";

const fakeChangeRoute: ChangeRoute = (component, info, child) => {
  if (info?.$ == "*") {
    if (info?.children) {
      expect(child?.name.split("Raw").join("")).toEqual("FourOhFour");
    } else {
      expect(component.name).toEqual("FourOhFour");
    }
  }
  expect(component?.name.split("Raw").join("")).toEqual(info?.key);
  if (info?.children) {
    expect(child?.name.split("Raw").join("")).toEqual(info?.childKey);
  }
};

describe("UNBOUND_ROUTES", () => {
  it("generates correct routes", () => {
    UNBOUND_ROUTES.map(r => r(fakeChangeRoute));
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
    expect(console.error).toHaveBeenCalledWith(fakeError);
  });
});
