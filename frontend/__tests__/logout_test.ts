jest.mock("../session", () => ({ Session: { clear: jest.fn() } }));

jest.mock("axios", () => ({ delete: jest.fn(() => Promise.resolve()) }));

import axios from "axios";
import { API } from "../api";
import { logout } from "../logout";
import { Session } from "../session";

API.setBaseUrl("");

describe("logout()", () => {
  it("logs out", () => {
    logout()();
    expect(Session.clear).toHaveBeenCalled();
    expect(axios.delete).toHaveBeenCalledWith("http://localhost/api/tokens/");
  });

  it("keeps token", () => {
    logout(true)();
    expect(Session.clear).toHaveBeenCalled();
    expect(axios.delete).not.toHaveBeenCalled();
  });
});
