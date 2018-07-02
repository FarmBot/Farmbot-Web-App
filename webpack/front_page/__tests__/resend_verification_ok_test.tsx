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
  const props = () => ({
    ok: jest.fn(),
    no: jest.fn(),
    onGoBack: jest.fn(),
    email: "foo@bar.com"
  });

  it("fires the `onGoBack()` callback", () => {
    const p = props();
    const el =mount<>(<ResendVerification {...p } />);
    el.find("button").first().simulate("click");
    expect(p.no).not.toHaveBeenCalled();
    expect(p.ok).not.toHaveBeenCalled();
    expect(p.onGoBack).toHaveBeenCalledTimes(1);
  });

  it("fires the `ok()` callback", (done) => {
    const p = props();
    const el =mount<>(<ResendVerification {...p } />);
    expect.assertions(3);
    el.find("button").last().simulate("click");
    const { calls } = p.ok.mock;
    setImmediate(() => {
      expect(p.no).not.toHaveBeenCalled();
      expect(calls.length).toEqual(1);
      expect(get(calls[0][0], "data", "NOT FOUND")).toEqual("whatever");
      done();
    });
  });
});
