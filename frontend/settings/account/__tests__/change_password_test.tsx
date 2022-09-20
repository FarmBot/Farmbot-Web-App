let mockPatch = Promise.resolve();
jest.mock("axios", () => ({
  patch: jest.fn(() => mockPatch),
}));

import React from "react";
import { mount } from "enzyme";
import { ChangePassword, ChangePWState } from "../change_password";
import { SpecialStatus } from "farmbot";
import { API } from "../../../api/api";
import { error, success } from "../../../toast/toast";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import axios from "axios";

describe("<ChangePassword />", () => {
  it("doesn't fire maybeClearForm() if form is filled", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.setState({
      status: SpecialStatus.DIRTY,
      form: { ...el.instance().state.form, password: "X" }
    });
    el.update();
    expect(el.instance().state.form.password).toEqual("X");
    expect(el.instance().state.status).toBe(SpecialStatus.DIRTY);
    el.instance().maybeClearForm();
    expect(el.instance().state.status).toBe(SpecialStatus.DIRTY);
    expect(el.instance().state.form.password).toEqual("X");
  });

  it("does fire maybeClearForm() when form is empty.", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.setState({
      status: SpecialStatus.DIRTY,
      form: {
        new_password: "",
        new_password_confirmation: "",
        password: ""
      }
    });
    el.instance().maybeClearForm();
    el.update();
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("sets a field", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().set("password")(inputEvent("foo"));
    el.update();
    expect(el.instance().state.form.password).toBe("foo");
  });

  it("rejects new == old password case", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "password",
      new_password: "password",
      new_password_confirmation: "password"
    };
    el.instance().save();
    const expectation = expect.stringContaining("Password not changed");
    expect(error).toHaveBeenCalledWith(expectation);
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("rejects too short new password", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "a",
      new_password: "a",
      new_password_confirmation: "a"
    };
    el.instance().save();
    const expectation = expect.stringContaining("New password must be at least");
    expect(error).toHaveBeenCalledWith(expectation);
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("rejects new != password confirmation case", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "aaaaaaaa",
      new_password: "bbbbbbbb",
      new_password_confirmation: "cccccccc"
    };
    el.instance().save();
    const expectation = expect.stringContaining("do not match");
    expect(error).toHaveBeenCalledWith(expectation);
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("throws a form error", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "password0",
      new_password: "password1",
      new_password_confirmation: "password2",
      extra_password: "password3",
    } as ChangePWState["form"];
    expect(el.instance().save).toThrow("form error");
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("cancels password change", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "aaaaaaaa",
      new_password: "bbbbbbbb",
      new_password_confirmation: "bbbbbbbb"
    };
    window.confirm = () => false;
    el.instance().save();
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  describe("AJAX", () => {
    API.setBaseUrl("localhost");

    it("saves (KO)", async () => {
      mockPatch = Promise.reject({ response: { data: "error" } });
      window.confirm = () => true;
      const el = mount<ChangePassword>(<ChangePassword />);
      const form = {
        password: "xxxxxxxx",
        new_password: "bbbbbbbb",
        new_password_confirmation: "bbbbbbbb"
      };
      el.instance().state.form = form;
      await el.instance().save();
      expect(axios.patch).toHaveBeenCalledWith("http://localhost/api/users/", form);
      expect(error).toHaveBeenCalledWith("Error: error");
      expect(success).not.toHaveBeenCalled();
      expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
    });

    it("saves (OK)", async () => {
      mockPatch = Promise.resolve();
      window.confirm = () => true;
      const el = mount<ChangePassword>(<ChangePassword />);
      const form = {
        password: "aaaaaaaa",
        new_password: "bbbbbbbb",
        new_password_confirmation: "bbbbbbbb"
      };
      el.instance().state.form = form;
      await el.instance().save();
      expect(axios.patch).toHaveBeenCalledWith("http://localhost/api/users/", form);
      expect(success).toHaveBeenCalledWith("Your password is changed.");
      expect(error).not.toHaveBeenCalled();
      expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
    });
  });
});
