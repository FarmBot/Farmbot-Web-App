import { TOURS } from "../data";

describe("TOURS()", () => {
  it("returns tour data", () => {
    const data = TOURS();
    expect(data.gettingStarted.steps[0].slug).toEqual("intro");
  });

  it("returns genesis tour data", () => {
    const data = TOURS("farmduino_k15");
    expect(data.tools.steps.map(step => step.slug)).toContain("custom");
  });

  it("returns express tour data", () => {
    const data = TOURS("express_k10");
    expect(data.tools.steps.map(step => step.slug)).not.toContain("custom");
  });
});
