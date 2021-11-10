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

window.alert = jest.fn();

window.TextDecoder = jest.fn();

jest.mock("../error_boundary", () => ({
  ErrorBoundary: (p: { children: React.ReactChild }) => <div>{p.children}</div>,
}));

jest.mock("@blueprintjs/core/lib/esm/components/hotkeys/hotkeysDialog", () => ({
  showHotkeysDialog: jest.fn(),
}));

jest.mock("../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
}));
