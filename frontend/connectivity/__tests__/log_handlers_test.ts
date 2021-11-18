import { onLogs } from "../log_handlers";
import { Log } from "farmbot/dist/resources/api_resources";
import { fakeState } from "../../__test_support__/fake_state";

describe("onLogs()", () => {
  it("inits log", () => {
    const msg = { message: "test log", type: undefined, channels: [] };
    const dispatch = jest.fn();
    const log = onLogs(dispatch, fakeState)(msg as unknown as Log);
    expect(log).toEqual(expect.objectContaining({
      body: expect.objectContaining({ type: "info" })
    }));
  });
});
