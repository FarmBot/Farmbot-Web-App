import { runLua } from "../run";

describe("runLua()", () => {
  it("returns actions", () => {
    const code = `
    move_absolute(1, 2, 3)
    wait_ms(1000)
    go_to_home("all")
    move{ y = 1 }
    `;
    expect(runLua(code, [])).toEqual([
      { type: "move_absolute", args: [1, 2, 3] },
      { type: "wait_ms", args: [1000] },
      { type: "go_to_home", args: ["all"] },
      { type: "move", args: [undefined, 1, undefined] },
    ]);
  });
});
