jest.mock("browser-speech", () => ({
  talk: jest.fn(),
}));
