import * as page from "../../util/page";
import { TosUpdate } from "../component";

let entryPointSpy: jest.SpyInstance;

beforeEach(() => {
  entryPointSpy = jest.spyOn(page, "entryPoint").mockImplementation(jest.fn());
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("TosUpdate loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPointSpy).toHaveBeenCalledWith(TosUpdate);
  });
});
