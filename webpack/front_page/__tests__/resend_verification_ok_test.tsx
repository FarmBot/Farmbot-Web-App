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
  let props = () => ({
    ok: jest.fn(),
    no: jest.fn(),
    onGoBack: jest.fn(),
    email: "foo@bar.com"
  });

  it("fires the `onGoBack()` callback", () => {
    const p = props();
    const el = mount(<ResendVerification {...p } />);
    el.find("button").first().simulate("click");
    const { calls } = p.onGoBack.mock;
    expect(p.no.mock.calls.length).toEqual(0);
    expect(p.ok.mock.calls.length).toEqual(0);
    expect(calls.length).toEqual(1);
  });

  it("fires the `ok()` callback", (done) => {
    const p = props();
    const el = mount(<ResendVerification {...p } />);
    expect.assertions(3);
    el.find("button").last().simulate("click");
    const { calls } = p.ok.mock;
    setImmediate(() => {
      expect(p.no.mock.calls.length).toEqual(0);
      expect(calls.length).toEqual(1);
      expect(get(calls[0][0], "data", "NOT FOUND")).toEqual("whatever");
      done();
    });
  });
});
