jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { FrontPage } from "../front_page";

afterAll(() => {
  jest.unmock("../../util/page");
});
describe("FrontPage loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(FrontPage);
  });
});
