jest.mock("takeme", () => ({ navigate: jest.fn() }));
jest.unmock("../history");

import { navigate } from "takeme";
import { getPathArray, push } from "../history";

describe("push()", () => {
  it("calls history with a URL", () => {
    push("/wow.html");
    expect(navigate).toHaveBeenCalledWith("/wow.html");
  });

  it("calls history, stripping /app", () => {
    push("/app/wow");
    expect(navigate).toHaveBeenCalledWith("/wow");
  });
});

describe("getPathArray()", () => {
  it("returns path array", () => {
    location.pathname = "/1/2/3";
    expect(getPathArray()).toEqual(["", "1", "2", "3"]);
  });
});
