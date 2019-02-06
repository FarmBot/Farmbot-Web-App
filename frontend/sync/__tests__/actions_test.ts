jest.mock("../../session", () => ({
  Session: {
    clear: jest.fn()
  }
}));

import { syncFail } from "../actions";
import { Session } from "../../session";

describe("syncFail", () => {
  it("tells you why you've been logged out", () => {
    const e = new Error("Whatever");
    console.error = jest.fn();
    expect(() => syncFail(e)).toThrowError(e);
    expect(console.error).toHaveBeenCalledWith("DATA SYNC ERROR!");
    expect(Session.clear).toHaveBeenCalled();
  });
});
