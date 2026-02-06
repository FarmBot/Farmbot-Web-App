jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { TosUpdate } from "../component";

afterAll(() => {
  jest.unmock("../../util/page");
});
describe("TosUpdate loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(TosUpdate);
  });
});
