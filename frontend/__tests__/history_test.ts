jest.mock("takeme", () => ({ navigate: jest.fn() }));
jest.unmock("../history");

import { navigate } from "takeme";
import { getPathArray, push } from "../history";

describe("push()", () => {
  it("calls history with a URL", () => {
    push("/app/wow.html");
    expect(navigate).toHaveBeenCalledWith("/wow.html");
  });
});

describe("getPathArray()", () => {
  it("returns path array", () => {
    location.pathname = "/1/2/3";
    expect(getPathArray()).toEqual(["", "1", "2", "3"]);
  });
});
