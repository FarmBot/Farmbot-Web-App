jest.mock("axios", () => ({
  default: {
    post: () => Promise.resolve({
      data: "whatever"
    })
  }
}));

import { mount } from "enzyme";
import * as React from "react";
import { ResendVerification } from "../resend_verification";
import { get } from "lodash";
import { API } from "../../api/index";

describe("resend_verification.tsx - base case", () => {
  API.setBaseUrl("http://localhost:3000");

  it("fires the `ok()` callback", (done) => {
    const props = {
      ok: jest.fn(),
      no: jest.fn(),
      email: "foo@bar.com"
    };
    const el = mount(<ResendVerification {...props} />);
    expect.assertions(3);
    el.find("button").first().simulate("click");
    const { calls } = props.ok.mock;
    setImmediate(() => {
      expect(props.no.mock.calls.length).toEqual(0);
      expect(calls.length).toEqual(1);
      expect(get(calls[0][0], "data", "NOT FOUND")).toEqual("whatever");
      done();
    });
  });
});
