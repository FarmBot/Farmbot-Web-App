import * as page from "../../util/page";
import { DemoIframe } from "../demo_iframe";

let entryPointSpy: jest.SpyInstance;

beforeEach(() => {
  entryPointSpy = jest.spyOn(page, "entryPoint").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("DemoIframe loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPointSpy).toHaveBeenCalledWith(DemoIframe);
  });
});
