import React from "react";

jest.mock("browser-speech", () => ({
  talk: jest.fn(),
}));

const { ancestorOrigins } = window.location;
delete (window as { location: Location | undefined }).location;
window.location = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  ancestorOrigins,
  pathname: "", href: "", hash: "", search: "",
  hostname: "", origin: "", port: "", protocol: "", host: "",
} as unknown as Location & string;

console.error = jest.fn(); // enzyme

window.alert = jest.fn();

window.TextDecoder = jest.fn(() => ({
  decode: jest.fn(x => "" + x), encoding: "", fatal: false, ignoreBOM: false,
}));

jest.mock("../error_boundary", () => ({
  ErrorBoundary: (p: { children: React.ReactNode }) => <div>{p.children}</div>,
}));

window.ResizeObserver = (() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
})) as any;

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
  Navigate: ({ to }: { to: string }) => <div>{mockNavigate(to)}</div>,
  Outlet: jest.fn(() => <div />),
}));
