let mockPut = Promise.resolve();
jest.mock("axios", () => ({
  put: jest.fn(() => mockPut),
}));

import React from "react";
import { mount } from "enzyme";
import { API } from "../../api";
import { error } from "../../toast/toast";
import { formEvent, inputEvent } from "../../__test_support__/fake_html_events";
import { PasswordReset } from "../password_reset";
import axios from "axios";

describe("<PasswordReset/>", () => {
  API.setBaseUrl("");

  it("handles form submission errors", async () => {
    jest.useFakeTimers();
    mockPut = Promise.reject({ response: { data: "error" } });
    const wrapper = mount<PasswordReset>(<PasswordReset />);
    const e = formEvent();
    await wrapper.instance().submit(e);
    expect(e.preventDefault).toHaveBeenCalled();
    await expect(axios.put).toHaveBeenCalledWith(":///api/password_resets/", {
      id: "localhost",
      password: "",
      password_confirmation: "",
    });
    await expect(error).toHaveBeenCalledWith("Error: error");
    jest.runAllTimers();
  });

  it("handles missing TOS agreement", async () => {
    mockPut = Promise.reject({ response: { data: "error", status: 451 } });
    const wrapper = mount<PasswordReset>(<PasswordReset />);
    const e = formEvent();
    await wrapper.instance().submit(e);
    expect(e.preventDefault).toHaveBeenCalled();
    await expect(axios.put).toHaveBeenCalledWith(":///api/password_resets/", {
      id: "localhost",
      password: "",
      password_confirmation: "",
    });
    await expect(error).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/tos_update");
  });

  it("resets the users password", async () => {
    mockPut = Promise.resolve();
    const el = mount(<PasswordReset />);
    el.setState({
      password: "knocknock",
      passwordConfirmation: "knocknock",
      serverURL: "localhost",
      serverPort: "3000"
    });
    await el.find("form").simulate("submit", formEvent());
    expect(axios.put).toHaveBeenCalledWith(":///api/password_resets/", {
      id: "localhost",
      password: "knocknock",
      password_confirmation: "knocknock"
    });
  });

  it("has a form set()ter", () => {
    const el = mount(<PasswordReset />);
    const i = el.instance() as PasswordReset;
    const field = "password";
    const value = "password123";
    i.setState = jest.fn(i.setState);
    i.set(field)(inputEvent(value));
    expect(i.setState).toHaveBeenCalledWith({ [field]: value });
  });
});
