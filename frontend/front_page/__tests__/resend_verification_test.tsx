let mockPost = Promise.resolve({ data: "whatever" });
jest.mock("axios", () => ({ post: () => mockPost }));

import React from "react";
import { mount } from "enzyme";
import { ResendVerification } from "../resend_verification";
import { get } from "lodash";
import { API } from "../../api/index";

describe("<ResendVerification />", () => {
  API.setBaseUrl("http://localhost:3000");
  const props = () => ({
    ok: jest.fn(),
    no: jest.fn(),
    onGoBack: jest.fn(),
    email: "foo@bar.com"
  });

  it("fires the `onGoBack()` callback", () => {
    const p = props();
    const el = mount(<ResendVerification {...p} />);
    el.find("button").first().simulate("click");
    expect(p.no).not.toHaveBeenCalled();
    expect(p.ok).not.toHaveBeenCalled();
    expect(p.onGoBack).toHaveBeenCalledTimes(1);
  });

  it("fires the `ok()` callback", async () => {
    const p = props();
    const el = mount(<ResendVerification {...p} />);
    await el.find("button").last().simulate("click");
    const { calls } = p.ok.mock;
    expect(p.no).not.toHaveBeenCalled();
    expect(calls.length).toEqual(1);
    expect(get(calls[0][0], "data", "NOT FOUND")).toEqual("whatever");
  });

  it("fires the `no()` callback", async () => {
    mockPost = Promise.reject({ err: "hi" });
    const p = props();
    const el = mount(<ResendVerification {...p} />);
    await el.find("button").last().simulate("click");
    const { calls } = p.no.mock;
    expect(p.ok).not.toHaveBeenCalled();
    expect(calls.length).toEqual(1);
    expect(get(calls[0][0], "err", "NOT FOUND")).toEqual("hi");
  });
});
