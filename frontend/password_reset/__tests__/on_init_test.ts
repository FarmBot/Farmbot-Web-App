jest.mock("react-dom", () => ({
  render: jest.fn()
}));

import { onInit } from "../on_init";
import { render } from "react-dom";

describe("onInit()", () => {
  it("Attaches to a DOM element", async (done) => {
    await onInit({}, jest.fn());
    expect({}).toBeTruthy();
    expect(render).toHaveBeenCalled();
    const [calls] = (render as jest.Mock).mock.calls;
    expect(calls[0].type.name).toBe("PasswordReset");
    done();
  });
});
