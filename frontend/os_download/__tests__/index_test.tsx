import * as page from "../../util/page";
import { OsDownloadPage } from "../content";

let entryPointSpy: jest.SpyInstance;

beforeEach(() => {
  entryPointSpy = jest.spyOn(page, "entryPoint").mockImplementation(jest.fn());
});

describe("OsDownloadPage loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPointSpy).toHaveBeenCalledWith(OsDownloadPage);
  });
});
