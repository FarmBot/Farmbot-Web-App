import { configureStore } from "../store";
import { get, set } from "lodash";

describe("configureStore", () => {
  it("calls the appropriate ENV", () => {
    const result1 = configureStore();

    const old = get(process.env, "NODE_ENV", "development");
    set(process.env, "NODE_ENV", "production");

    const result2 = configureStore();
    set(process.env, "NODE_ENV", old);

    expect(result1).not.toBe(result2);
  });

  it("Does not crash if process.env.NODE_ENV is undefined", () => {
    const old = get(process.env, "NODE_ENV", "development");
    set(process.env, "NODE_ENV", "");
    const result1 = configureStore();

    expect(result1)
      .toEqual(expect.objectContaining({ getState: expect.anything() }));
    set(process.env, "NODE_ENV", old);
  });

  it("does not crash on malformed states", () => {
    sessionStorage.setItem("lastState", "Not JSON at all.");
    const result1 = configureStore().getState();
    // tslint:disable-next-line:no-null-keyword
    expect(result1.auth).toBe(null); // Initialize to default value.
  });
});
