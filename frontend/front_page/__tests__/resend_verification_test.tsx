let mockPost = Promise.resolve({ data: "whatever" });
jest.mock("axios", () => ({ post: () => mockPost }));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ResendVerification } from "../resend_verification";
import { get } from "lodash";
import { API } from "../../api/index";

afterAll(() => {
  jest.unmock("axios");
});
describe("<ResendVerification />", () => {
  API.setBaseUrl("http://localhost:3000");
  const flushPromises = async () => {
    await Promise.resolve();
    await Promise.resolve();
  };

  beforeEach(() => {
    mockPost = Promise.resolve({ data: "whatever" });
  });

  const props = () => ({
    ok: jest.fn(),
    no: jest.fn(),
    onGoBack: jest.fn(),
    email: "foo@bar.com"
  });

  it("fires the `onGoBack()` callback", () => {
    const p = props();
    render(<ResendVerification {...p} />);
    fireEvent.click(screen.getByTitle("go back"));
    expect(p.no).not.toHaveBeenCalled();
    expect(p.ok).not.toHaveBeenCalled();
    expect(p.onGoBack).toHaveBeenCalledTimes(1);
  });

  it("fires the `ok()` callback", async () => {
    const p = props();
    render(<ResendVerification {...p} />);
    fireEvent.click(screen.getByTitle("Resend Verification Email"));
    await flushPromises();
    const { calls } = p.ok.mock;
    expect(p.no).not.toHaveBeenCalled();
    expect(calls.length).toEqual(1);
    expect(get(calls[0][0], "data", "NOT FOUND")).toEqual("whatever");
  });

  it("fires the `no()` callback", async () => {
    mockPost = Promise.reject({ err: "hi" });
    const p = props();
    render(<ResendVerification {...p} />);
    fireEvent.click(screen.getByTitle("Resend Verification Email"));
    await flushPromises();
    const { calls } = p.no.mock;
    expect(p.ok).not.toHaveBeenCalled();
    expect(calls.length).toEqual(1);
    expect(get(calls[0][0], "err", "NOT FOUND")).toEqual("hi");
  });
});
