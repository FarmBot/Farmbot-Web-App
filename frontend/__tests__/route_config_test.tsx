import { UNBOUND_ROUTES, UnboundRouteConfig } from "../route_config";
import { RouteEnterEvent } from "takeme";

interface ConnectedComponent {
  name: string;
  WrappedComponent: React.ComponentType;
}

type Info = UnboundRouteConfig<{}, {}>;

const fakeCallback = (
  component: ConnectedComponent,
  child: ConnectedComponent | undefined,
  info: Info
) => {
  if (info.$ == "*") {
    expect(component.name).toEqual("FourOhFour");
  } else {
    expect(component.name).toBe("Connect");
    expect(component.WrappedComponent.name).toContain(info.key);
    if (child && info.children) {
      expect(child.name).toBe("Connect");
      expect(child.WrappedComponent.name).toContain(info.childKey);
    }
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
      .map(r => r(fakeCallback))
      .map(r => r.enter && r.enter(fakeRouteEnterEvent));
  });

  it("generates crash route", async () => {
    const fakeError = new Error("fake callback error");
    const cb = jest.fn()
      .mockImplementationOnce(() => { throw fakeError; })
      .mockImplementationOnce(x => { expect(x.name).toEqual("Apology"); });
    const r = UNBOUND_ROUTES[0](cb);
    console.error = jest.fn();
    r.enter && await r.enter(fakeRouteEnterEvent);
    expect(console.error).toHaveBeenCalledWith(fakeError);
  });
});
