jest.resetAllMocks();
jest.mock("../toast/toast", () => ({
  fun: jest.fn(),
  init: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  busy: jest.fn(),
}));
