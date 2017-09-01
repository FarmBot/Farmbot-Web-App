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

  it("fires the `no()` callback", () => {
    const props = {
      ok: jest.fn(),
      no: jest.fn(),
      email: "foo@bar.com"
    };
    const el = mount(<ResendVerification {...props} />);
    el.render();
    el.find("form").at(0).simulate("submit");
    el.update();
    debugger;
    const { calls } = props.no.mock;
    expect(props.ok.mock.calls.length).toEqual(0);
    expect(calls.length).toEqual(1);
    expect(get(calls[0][0], "err", "NOT FOUND")).toEqual("hi");
  });
});
