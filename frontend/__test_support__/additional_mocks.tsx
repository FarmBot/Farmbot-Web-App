import React from "react";

jest.mock("browser-speech", () => ({
  talk: jest.fn(),
}));

jest.mock("../open_farm/cached_crop", () => ({
  cachedCrop: jest.fn(() => Promise.resolve({ svg_icon: "icon" })),
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
};

console.error = jest.fn(); // enzyme

window.alert = jest.fn();

window.TextDecoder = jest.fn(() => ({
  decode: jest.fn(x => "" + x), encoding: "", fatal: false, ignoreBOM: false,
}));

jest.mock("../error_boundary", () => ({
  ErrorBoundary: (p: { children: React.ReactChild }) => <div>{p.children}</div>,
}));

jest.mock("../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
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
