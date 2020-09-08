jest.mock("axios", () => ({
  post: () => Promise.reject({ err: "hi" })
}));

import React from "react";
import { mount } from "enzyme";
import { ResendVerification } from "../resend_verification";
import { get } from "lodash";
import { API } from "../../api/index";

describe("resend_verification.tsx - failure case", () => {
  API.setBaseUrl("http://localhost:3000");

  it("fires the `no()` callback", async () => {
    const props = {
      ok: jest.fn(),
      no: jest.fn(),
      onGoBack: jest.fn(),
      email: "foo@bar.com"
    };
    const el = mount(<ResendVerification {...props} />);
    await el.find("button").last().simulate("click");
    const { calls } = props.no.mock;
    expect(props.ok).not.toHaveBeenCalled();
    expect(calls.length).toEqual(1);
    expect(get(calls[0][0], "err", "NOT FOUND")).toEqual("hi");
  });
});
