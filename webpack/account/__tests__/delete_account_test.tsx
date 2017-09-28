import * as React from "react";
import { DeleteAccount } from "../components/delete_account";
import { mount } from "enzyme";

describe("<DeleteAccount/>", () => {
  it("executes account deletion", () => {
    const fn = jest.fn();
    const el = mount(<DeleteAccount onClick={fn} />);
    el.setState({ password: "123" });
    el.find("button.red").last().simulate("click");
    expect(fn.mock.calls.length).toBe(1);
    expect(fn.mock.calls[0][0]).toBe("123");
  });
});
