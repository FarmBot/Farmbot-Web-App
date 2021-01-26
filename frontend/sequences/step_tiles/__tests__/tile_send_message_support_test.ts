import { channel } from "../tile_send_message_support";

describe("channel()", () => {
  it("returns channel", () => {
    expect(channel("toast")).toEqual({
      kind: "channel", args: { channel_name: "toast" }
    });
  });
});
