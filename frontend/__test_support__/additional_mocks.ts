jest.mock("browser-speech", () => ({
  talk: jest.fn(),
}));

jest.mock("../open_farm/cached_crop", () => ({
  cachedCrop: jest.fn(() => Promise.resolve({ svg_icon: "icon" })),
}));

const { ancestorOrigins } = window.location;
delete window.location;
window.location = {
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
  ancestorOrigins,
  pathname: "", href: "", hash: "", search: "",
  hostname: "", origin: "", port: "", protocol: "", host: "",
};
