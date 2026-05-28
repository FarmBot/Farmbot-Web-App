import { runLua } from "../run";

describe("runLua()", () => {
  it("returns actions", () => {
    const code = `
    move_absolute(1, 2, 3)
    wait_ms(1000)
    go_to_home("all")
    move{ y = 1 }
    `;
    expect(runLua(0, code, [])).toEqual([
      { type: "move_absolute", args: [1, 2, 3] },
      { type: "wait_ms", args: [1000] },
      { type: "go_to_home", args: ["all"] },
      {
        type: "_move",
        args: [
          "[{\"kind\":\"axis_overwrite\",\"args\":{\"axis\":\"y\",\""
          + "axis_operand\":{\"kind\":\"numeric\",\"args\":{\"number\":1}}}}]",
        ],
      },
    ]);
  });

  it("posts points through the api shim", () => {
    const code = `
    local created = api{
      url = "/api/points",
      method = "POST",
      body = {
        pointer_type = "GenericPointer",
        name = "test",
        x = 1,
        y = 2,
        z = 3,
        radius = 4,
        meta = {},
      },
    }
    if created then
      toast("created")
    end
    `;

    expect(runLua(0, code, [])).toEqual([
      {
        type: "create_point",
        args: [
          "{\"pointer_type\":\"GenericPointer\",\"name\":\"test\",\"x\":1,"
          + "\"y\":2,\"z\":3,\"radius\":4,\"meta\":[]}",
        ],
      },
      { type: "send_message", args: ["info", "created", "toast"] },
    ]);
  });

  it("reports unsupported point api methods", () => {
    const code = `
    local deleted = api{
      url = "/api/points",
      method = "DELETE",
    }
    if not deleted then
      toast("not deleted", "error")
    end
    `;

    expect(runLua(0, code, [])).toEqual([
      {
        type: "send_message",
        args: ["error", "API call DELETE /api/points not implemented."],
      },
      { type: "send_message", args: ["error", "not deleted", "toast"] },
    ]);
  });
});
