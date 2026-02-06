jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { DemoIframe } from "../demo_iframe";

afterAll(() => {
  jest.unmock("../../util/page");
});
describe("DemoIframe loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(DemoIframe);
  });
});
