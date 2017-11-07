import * as React from "react";
import { ChangePassword } from "../components/index";
import { mount } from "enzyme";
import { getProp } from "../../__test_support__/helpers";
import { SpecialStatus } from "../../resources/tagged_resources";
import * as moxios from "moxios";
import { API } from "../../api/api";
describe("<ChangePassword/>", function () {

  function testCase() {
    const el = mount(<ChangePassword />);
    return {
      el,
      instance(): ChangePassword { return el.instance() as ChangePassword; }
    };
  }

  it("clears the form", function () {
    const { el, instance } = testCase();
    // let inst = el.instance() as ChangePassword;
    el.setState({
      status: SpecialStatus.DIRTY,
      form: { ...instance().state.form, password: "X" }
    });
    el.update();
    expect(getProp(el.find("input").first(), "value")).toEqual("X");
    expect(instance().state.status).toBe(SpecialStatus.DIRTY);
    instance().maybeClearForm();
    expect(instance().state.status).toBe(SpecialStatus.DIRTY);
    expect(getProp(el.find("input").first(), "value")).toEqual("X");
  });

  it("doesnt fire maybeClearForm() if form is filled", () => {
    const { el, instance } = testCase();
    el.setState({
      status: SpecialStatus.DIRTY,
      form: { ...instance().state.form, password: "X" }
    });
    el.update();
    expect(getProp(el.find("input").first(), "value")).toEqual("X");
    expect(instance().state.status).toBe(SpecialStatus.DIRTY);
    instance().maybeClearForm();
    expect(instance().state.status).toBe(SpecialStatus.DIRTY);
    expect(getProp(el.find("input").first(), "value")).toEqual("X");
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

  describe("AJAX", () => {
    beforeEach(function () {
      // import and pass your custom axios instance to this method
      moxios.install();
    });

    afterEach(function () {
      // import and pass your custom axios instance to this method
      moxios.uninstall();
    });

    it("saves (KO)", (done) => {
      const { instance } = testCase();
      API.setBaseUrl("localhost");
      instance().save();
      moxios.wait(function () {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 422,
          response: { bad: "data" }
        }).then(function (resp) {
          expect(resp.config.url).toContain("api/users");
          expect(resp.config.method).toEqual("patch");
          done();
        });

      });
    });

    it("saves (OK)", (done) => {
      const { instance } = testCase();
      API.setBaseUrl("localhost");
      instance().save();
      moxios.wait(function () {
        const request = moxios.requests.mostRecent();
        request.respondWith({
          status: 200,
          response: {}
        }).then(function (resp) {
          expect(resp.config.url).toContain("api/users");
          expect(resp.config.method).toEqual("patch");
          done();
        });

      });
    });
  });
});
