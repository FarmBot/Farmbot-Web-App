jest.mock("i18next", () => ({
  t: (i: string) => i,
  init: jest.fn()
}));
