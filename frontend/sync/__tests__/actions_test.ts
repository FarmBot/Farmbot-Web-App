import { syncFail } from "../actions";
import { Session } from "../../session";


describe("syncFail", () => {
  it("tells you why you've been logged out", () => {
    const e = new Error("Whatever");
    console.error = jest.fn();
    jest.spyOn(Session, "clear")
      .mockImplementation((() => undefined as never) as typeof Session.clear);
    expect(() => syncFail(e)).toThrow(e);
    expect(console.error).toHaveBeenCalledWith("DATA SYNC ERROR!");
    expect(Session.clear).toHaveBeenCalled();
  });
});
