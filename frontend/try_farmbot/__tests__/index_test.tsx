import * as page from "../../util/page";
import { TryFarmbot } from "../try_farmbot";

let entryPointSpy: jest.SpyInstance;

beforeEach(() => {
  entryPointSpy = jest.spyOn(page, "entryPoint").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("TryFarmbot loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPointSpy).toHaveBeenCalledWith(TryFarmbot);
  });
});
