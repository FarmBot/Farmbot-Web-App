import * as page from "../../util/page";
import { Promo } from "../promo";

let entryPointSpy: jest.SpyInstance;

beforeEach(() => {
  entryPointSpy = jest.spyOn(page, "entryPoint").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("Promo loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPointSpy).toHaveBeenCalledWith(Promo);
  });
});
