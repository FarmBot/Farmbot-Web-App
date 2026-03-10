import * as page from "../../util/page";
import { FrontPage } from "../front_page";

let entryPointSpy: jest.SpyInstance;

beforeEach(() => {
  entryPointSpy = jest.spyOn(page, "entryPoint").mockImplementation(jest.fn());
});

describe("FrontPage loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPointSpy).toHaveBeenCalledWith(FrontPage);
  });
});
