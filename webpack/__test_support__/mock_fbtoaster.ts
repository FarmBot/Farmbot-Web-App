jest.mock("farmbot-toastr", () => ({
  init: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
  error: jest.fn()
}));
