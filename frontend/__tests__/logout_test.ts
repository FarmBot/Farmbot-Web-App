jest.mock("../session", () => ({ Session: { clear: jest.fn() } }));

import { API } from "../api";
import { logout } from "../logout";
import { Session } from "../session";

API.setBaseUrl("");

describe("logout()", () => {
  it("logs out", () => {
    logout();
    expect(Session.clear).toHaveBeenCalled();
  });
});
