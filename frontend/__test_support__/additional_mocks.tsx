import React from "react";

jest.mock("browser-speech", () => ({
  talk: jest.fn(),
}));

const { ancestorOrigins } = window.location;
const mockedLocation = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  ancestorOrigins,
  href: "http://localhost/",
  pathname: "/",
  hash: "",
  search: "",
  hostname: "localhost",
  origin: "http://localhost",
  port: "",
  protocol: "http:",
  host: "localhost",
  toString() {
    return this.href;
  },
} as unknown as Location & string;
const applyLocation = (target: Window, value: typeof mockedLocation) => {
  try {
    Object.defineProperty(target, "location", {
      configurable: true,
      writable: true,
      value,
    });
  } catch {
    try {
      Object.defineProperty(target.location, "pathname", {
        configurable: true,
        writable: true,
        value: value.pathname,
      });
    } catch {
      target.location.pathname = value.pathname;
    }
    Object.assign(target.location, value);
  }
};
applyLocation(window, mockedLocation);
if (globalThis !== window) {
  applyLocation(globalThis as Window, mockedLocation);
}

console.error = jest.fn(); // enzyme

window.alert = jest.fn();
// Ensure unqualified `alert()` calls hit the mock.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).alert = window.alert;
window.addEventListener("error", event => event.preventDefault());
window.addEventListener("unhandledrejection", event => event.preventDefault());

window.TextDecoder = jest.fn(() => ({
  decode: jest.fn(x => "" + x),
  encoding: "",
  fatal: false,
  ignoreBOM: false,
}));

class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _callback?: (entries: any) => void,
  ) { }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.ResizeObserver = MockResizeObserver as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = MockResizeObserver as any;

jest.mock("@rollbar/react", () => ({
  Provider: ({ children }: { children: React.ReactNode }) =>
    <div className={"rollbar"}>{children}</div>,
}));

global.mockNavigate = jest.fn(() => jest.fn());

jest.mock("react-router", () => ({
  BrowserRouter: jest.fn(({ children }) => <div>{children}</div>),
  MemoryRouter: jest.fn(({ children }) => <div>{children}</div>),
  Route: jest.fn(({ children }) => <div>{children}</div>),
  Routes: jest.fn(({ children }) => <div>{children}</div>),
  useNavigate: () => mockNavigate,
  useLocation: () => window.location,
  Navigate: ({ to }: { to: string }) => <div>{mockNavigate(to)}</div>,
  Outlet: jest.fn(() => <div />),
}));

jest.mock("delaunator", () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      triangles: [0, 1, 2, 3, 4, 5],
    })),
  },
}));
