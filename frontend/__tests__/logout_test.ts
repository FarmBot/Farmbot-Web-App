import axios from "axios";
import { API } from "../api";
import { logout } from "../logout";
import { Session } from "../session";

API.setBaseUrl("");

describe("logout()", () => {
  let mockDelete = jest.fn(() => Promise.resolve());
  let clearSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDelete = jest.fn(() => Promise.resolve());
    clearSpy = jest.spyOn(Session, "clear").mockImplementation(jest.fn());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axios as any).delete = mockDelete;
  });

  afterEach(() => {
    clearSpy.mockRestore();
  });

  it("logs out", () => {
    logout()();
    expect(Session.clear).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith("http://localhost/api/tokens/");
  });

  it("keeps token", () => {
    logout(true)();
    expect(Session.clear).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});
