jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { OsDownloadPage } from "../content";

afterAll(() => {
  jest.unmock("../../util/page");
});
describe("OsDownloadPage loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(OsDownloadPage);
  });
});
