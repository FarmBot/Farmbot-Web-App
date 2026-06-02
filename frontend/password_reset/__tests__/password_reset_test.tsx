let mockPut = Promise.resolve();

import React from "react";
import { API } from "../../api";
import { error } from "../../toast/toast";
import { formEvent, inputEvent } from "../../__test_support__/fake_html_events";
import { PasswordReset } from "../password_reset";
import axios from "axios";
import { render } from "@testing-library/react";

describe("<PasswordReset/>", () => {
  API.setBaseUrl("");
  let originalPathname: string;
  let axiosPutSpy: jest.SpyInstance;

  beforeEach(() => {
    originalPathname = location.pathname;
    location.pathname = "/password_resets/";
    axiosPutSpy = jest.spyOn(axios, "put")
      .mockImplementation(() => mockPut);
  });

  afterEach(() => {
    location.pathname = originalPathname;
    axiosPutSpy.mockRestore();
  });

  it("handles form submission errors", async () => {
    jest.useFakeTimers();
    mockPut = Promise.reject({ response: { data: "error" } });
    const wrapper = new PasswordReset({});
    const e = formEvent();
    const id = window.location.href.split("/").pop();
    wrapper.submit(e);
    await Promise.resolve();
    await Promise.resolve();
    expect(e.preventDefault).toHaveBeenCalled();
    await expect(axios.put).toHaveBeenCalledWith(
      "http://localhost/api/password_resets/",
      {
        id,
        password: "",
        password_confirmation: "",
      },
    );
    await expect(error).toHaveBeenCalledWith("Error: error");
    jest.runAllTimers();
  });

  it("handles missing TOS agreement", async () => {
    mockPut = Promise.reject({ response: { data: "error", status: 451 } });
    const wrapper = new PasswordReset({});
    const e = formEvent();
    const id = window.location.href.split("/").pop();
    wrapper.submit(e);
    await Promise.resolve();
    await Promise.resolve();
    expect(e.preventDefault).toHaveBeenCalled();
    await expect(axios.put).toHaveBeenCalledWith(
      "http://localhost/api/password_resets/",
      {
        id,
        password: "",
        password_confirmation: "",
      },
    );
    await expect(error).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/tos_update");
  });

  it("resets the users password", async () => {
    mockPut = Promise.resolve();
    const el = new PasswordReset({});
    el.state = {
      ...el.state,
      password: "knocknock",
      passwordConfirmation: "knocknock",
      serverURL: "localhost",
      serverPort: "3000",
    };
    const id = window.location.href.split("/").pop();
    el.submit(formEvent());
    await Promise.resolve();
    expect(axios.put).toHaveBeenCalledWith(
      "http://localhost/api/password_resets/",
      {
        id,
        password: "knocknock",
        password_confirmation: "knocknock",
      },
    );
  });

  it("has a form set()ter", () => {
    const i = new PasswordReset({});
    const field = "password";
    const value = "password123";
    i.setState = jest.fn(i.setState);
    i.set(field)(inputEvent(value));
    expect(i.setState).toHaveBeenCalledWith({ [field]: value });
  });

  it("renders the password reset form", () => {
    const { container } = render(<PasswordReset />);
    const helpText = "Password must be 8 or more characters.";

    expect(container.querySelector(".static-page")).toBeTruthy();
    expect(container.querySelector("h1")?.textContent)
      .toContain("Reset your password");
    expect(container.querySelector(`[aria-label='${helpText}']`)).toBeTruthy();
    expect(container.textContent).toContain("New Password");
    expect(container.textContent).toContain("Confirm New Password");
    expect(container.querySelectorAll("input[type='password']").length)
      .toEqual(2);
    expect(container.querySelector("button")?.getAttribute("title"))
      .toEqual("Reset password");
    expect(container.querySelector("button")?.textContent).toContain("Reset");
    expect(container.querySelector(".toast-container")).toBeTruthy();
  });
});
