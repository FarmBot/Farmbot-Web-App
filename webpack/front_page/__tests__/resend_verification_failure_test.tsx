jest.mock("axios", () => ({
  default: {
    post: () => Promise.reject({
      err: "hi"
    })
  }
}));

import { mount } from "enzyme";
import * as React from "react";
import { ResendVerification } from "../resend_verification";
import { get } from "lodash";
import { API } from "../../api/index";

describe("resend_verification.tsx - failure case", () => {
  API.setBaseUrl("http://localhost:3000");

  it("fires the `no()` callback", (done) => {
    const props = {
      ok: jest.fn(),
      no: jest.fn(),
      onGoBack: jest.fn(),
      email: "foo@bar.com"
    };
    const el =mount<>(<ResendVerification {...props} />);
    expect.assertions(3);
    el.find("button").last().simulate("click");
    const { calls } = props.no.mock;
    setImmediate(() => {
      expect(props.ok).not.toHaveBeenCalled();
      expect(calls.length).toEqual(1);
      expect(get(calls[0][0], "err", "NOT FOUND")).toEqual("hi");
      done();
    });
  });
});
