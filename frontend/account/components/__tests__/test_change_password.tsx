import * as React from "react";
import { ChangePassword } from "../change_password";
import { mount } from "enzyme";
import { SpecialStatus } from "farmbot";
import * as moxios from "moxios";
import { API } from "../../../api/api";
import { error } from "../../../toast/toast";

describe("<ChangePassword/>", function () {
  function testCase() {
    const el = mount(<ChangePassword />);
    return {
      el,
      instance(): ChangePassword { return el.instance() as ChangePassword; }
    };
  }

  it("doesn't fire maybeClearForm() if form is filled", () => {
    const { el, instance } = testCase();
    el.setState({
      status: SpecialStatus.DIRTY,
      form: { ...instance().state.form, password: "X" }
    });
    el.update();
    expect(instance().state.form.password).toEqual("X");
    expect(instance().state.status).toBe(SpecialStatus.DIRTY);
    instance().maybeClearForm();
    expect(instance().state.status).toBe(SpecialStatus.DIRTY);
    expect(instance().state.form.password).toEqual("X");
  });

  it("it does fire maybeClearForm() when form is empty.", () => {
    const { el, instance } = testCase();
    el.setState({
      status: SpecialStatus.DIRTY,
      form: {
        new_password: "",
        new_password_confirmation: "",
        password: ""
      }
    });
    instance().maybeClearForm();
    el.update();
    expect(instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("sets a field", () => {
    const { el, instance } = testCase();
    // tslint:disable-next-line:no-any
    instance().set("password")({ currentTarget: { value: "foo" } } as any);
    el.update();
    expect(instance().state.form.password).toBe("foo");
  });

  it("rejects new == old password case", () => {
    const { instance } = testCase();
    instance().state.form = {
      password: "a",
      new_password: "a",
      new_password_confirmation: "a"
    };
    instance().save();
    const expectation = expect.stringContaining("Password not changed");
    expect(error).toHaveBeenCalledWith(expectation, "Error");
    expect(instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("rejects new != password confirmation case", () => {
    const { instance } = testCase();
    instance().state.form = {
      password: "a",
      new_password: "b",
      new_password_confirmation: "c"
    };
    instance().save();
    const expectation = expect.stringContaining("do not match");
    expect(error).toHaveBeenCalledWith(expectation, "Error");
    expect(instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("throws a form error", () => {
    const { instance } = testCase();
    // tslint:disable-next-line:no-any
    instance().state.form = {} as any;
    expect(instance().save).toThrowError("form error");
    expect(instance().state.status).toBe(SpecialStatus.SAVED);
  });

  it("cancels password change", () => {
    const { instance } = testCase();
    instance().state.form = {
      password: "a",
      new_password: "b",
      new_password_confirmation: "b"
    };
    window.confirm = () => false;
    instance().save();
    expect(instance().state.status).toBe(SpecialStatus.SAVED);
  });

  describe("AJAX", () => {
    beforeEach(function () {
      // import and pass your custom axios instance to this method
      moxios.install();
      API.setBaseUrl("localhost");
      window.confirm = () => true;
    });

    afterEach(function () {
      moxios.uninstall();
    });

    it("saves (KO)", (done) => {
      const { instance } = testCase();
      instance().state.form = {
        password: "x",
        new_password: "b",
        new_password_confirmation: "b"
      };
      instance().save();
      moxios.wait(function () {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 422,
          response: { bad: "data" }
        }).then(function (resp) {
          expect(resp.config.url).toContain("api/users");
          expect(resp.config.method).toEqual("patch");
          expect(instance().state.status).toBe(SpecialStatus.SAVED);
          done();
        });
      });
    });

    it("saves (OK)", (done) => {
      const { instance } = testCase();
      instance().state.form = {
        password: "a",
        new_password: "b",
        new_password_confirmation: "b"
      };
      instance().save();
      moxios.wait(function () {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          response: {}
        }).then(function (resp) {
          expect(resp.config.url).toContain("api/users");
          expect(resp.config.method).toEqual("patch");
          expect(instance().state.status).toBe(SpecialStatus.SAVED);
          done();
        });
      });
    });

  });
});
