jest.mock("react-router-dom", () => ({
  useHistory: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
jest.unmock("../history");

import { useHistory } from "react-router-dom";
import { getPathArray, push } from "../history";

describe("push()", () => {
  it("calls history with a URL", () => {
    const history = useHistory();
    push("/wow.html");
    expect(history.push).toHaveBeenCalledWith("/wow.html");
  });

  it("calls history, stripping /app", () => {
    const history = useHistory();
    push("/app/wow");
    expect(history.push).toHaveBeenCalledWith("/wow");
  });
});

describe("getPathArray()", () => {
  it("returns path array", () => {
    location.pathname = "/1/2/3";
    expect(getPathArray()).toEqual(["", "1", "2", "3"]);
  });
});
