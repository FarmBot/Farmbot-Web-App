jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { TryFarmbot } from "../try_farmbot";

afterAll(() => {
  jest.unmock("../../util/page");
});
describe("TryFarmbot loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(TryFarmbot);
  });
});
