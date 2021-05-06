import React from "react";
import moxios from "moxios";
import { mount } from "enzyme";
import { ChangePassword, ChangePWState } from "../change_password";
import { SpecialStatus } from "farmbot";
import { API } from "../../../api/api";
import { error } from "../../../toast/toast";
import { AxiosResponse } from "axios";
import { inputEvent } from "../../../__test_support__/fake_html_events";

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
      password: "a",
      new_password: "a",
      new_password_confirmation: "a"
    };
    el.instance().save();
    const expectation = expect.stringContaining("Password not changed");
    expect(error).toHaveBeenCalledWith(expectation);
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("rejects new != password confirmation case", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "a",
      new_password: "b",
      new_password_confirmation: "c"
    };
    el.instance().save();
    const expectation = expect.stringContaining("do not match");
    expect(error).toHaveBeenCalledWith(expectation);
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("throws a form error", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {} as ChangePWState["form"];
    expect(el.instance().save).toThrowError("form error");
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("cancels password change", () => {
    const el = mount<ChangePassword>(<ChangePassword />);
    el.instance().state.form = {
      password: "a",
      new_password: "b",
      new_password_confirmation: "b"
    };
    window.confirm = () => false;
    el.instance().save();
    expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
  });

  describe("AJAX", () => {
    API.setBaseUrl("localhost");

    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());

    const respondWith =
      (response: { status: number, response: {} }) =>
        new Promise<Partial<AxiosResponse>>(
          (resolve: (value: Partial<AxiosResponse>) => void, reject) =>
            moxios.wait(() => {
              moxios.requests.mostRecent()
                .respondWith(response)
                .then(resolve, reject);
            }));

    it("saves (KO)", async () => {
      window.confirm = () => true;
      const el = mount<ChangePassword>(<ChangePassword />);
      el.instance().state.form = {
        password: "x",
        new_password: "b",
        new_password_confirmation: "b"
      };
      el.instance().save();
      const resp = await respondWith({ status: 422, response: { bad: "data" } });
      expect(resp.config?.url).toContain("api/users");
      expect(resp.config?.method).toEqual("patch");
      expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
    });

    it("saves (OK)", async () => {
      window.confirm = () => true;
      const el = mount<ChangePassword>(<ChangePassword />);
      el.instance().state.form = {
        password: "a",
        new_password: "b",
        new_password_confirmation: "b"
      };
      el.instance().save();
      const resp = await respondWith({ status: 200, response: {} });
      expect(resp.config?.url).toContain("api/users");
      expect(resp.config?.method).toEqual("patch");
      expect(el.instance().state.status).toBe(SpecialStatus.SAVED);
    });
  });
});
