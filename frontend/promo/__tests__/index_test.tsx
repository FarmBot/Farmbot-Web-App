jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { Promo } from "../promo";

afterAll(() => {
  jest.unmock("../../util/page");
});
describe("Promo loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(Promo);
  });
});
