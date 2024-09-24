jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { Promo } from "../promo";

describe("Promo loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(Promo);
  });
});
