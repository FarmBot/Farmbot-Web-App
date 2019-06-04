jest.mock("browser-speech", () => ({
  talk: jest.fn(),
}));

jest.mock("../open_farm/cached_crop", () => ({
  cachedCrop: jest.fn(() => Promise.resolve({ svg_icon: "icon" })),
}));
