import { UNBOUND_ROUTES, UnboundRouteConfig } from "../route_config";
import { RouteEnterEvent } from "takeme";

interface ConnectedComponent {
    name: string;
    WrappedComponent: React.ComponentType;
}

type Info = UnboundRouteConfig<{}, {}>;

function mapper(bind_to: Function, index: number) {
    return bind_to((x: ConnectedComponent, y: ConnectedComponent | undefined, z: Info) => {
        if (z.$ == "*") {
            expect(x.WrappedComponent.name).toEqual("FourOhFour");
            return;
        }

        expect(index).toBeGreaterThan(-1);
        expect(x.name).toBe("Connect");
        expect(x.WrappedComponent.name).toContain(z.key);
        if (y && z.children) {
            expect(y.name).toBe("Connect");
            expect(y.WrappedComponent.name).toContain(z.childKey);
        }
    });
}

describe("UNBOUND_ROUTES", () => {
    it("generates correct routes", () => {
        const fake: RouteEnterEvent = {
            params: { splat: "????" },
            oldPath: "??",
            newPath: "??"
        };
        UNBOUND_ROUTES.map(mapper).map(x => { x.enter && x.enter(fake); });
    });
});
