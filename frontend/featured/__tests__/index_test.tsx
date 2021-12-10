jest.mock("../../util/page", () => ({ entryPoint: jest.fn() }));

import { entryPoint } from "../../util";
import { FeaturedSequencePage } from "../content";

describe("FeaturedSequencePage loader", () => {
  it("calls entryPoint", async () => {
    await import("../index");
    expect(entryPoint).toHaveBeenCalledWith(FeaturedSequencePage);
  });
});
