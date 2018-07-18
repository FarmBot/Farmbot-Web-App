jest.mock("farmbot-toastr", () => ({
  fun: jest.fn(),
  init: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warning: jest.fn()
}));
