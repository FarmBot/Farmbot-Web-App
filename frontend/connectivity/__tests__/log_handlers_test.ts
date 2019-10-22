import { onLogs } from "../log_handlers";
import { Log } from "farmbot/dist/resources/api_resources";

describe("onLogs()", () => {
  it("inits log", () => {
    const msg = { message: "test log", type: undefined, channels: [] };
    const log = onLogs(jest.fn(), jest.fn())(msg as unknown as Log);
    expect(log).toEqual(expect.objectContaining({
      body: expect.objectContaining({ type: "info" })
    }));
  });
});
