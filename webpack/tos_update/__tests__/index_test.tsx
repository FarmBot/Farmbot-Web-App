jest.mock("../../util", function () {
  return {
    hardRefresh: () => { }
  };
});

jest.mock("../../i18n", () => {
  return {
    detectLanguage: () => Promise.resolve({})
  };
});

import * as React from "react";
import { TosUpdate } from "../index";
import { shallow } from "enzyme";
describe("<TosUpdate/>", () => {
  it("toggles server options", () => {
    const x = shallow(<TosUpdate />);
    const wow = x.instance() as TosUpdate;
    wow.toggleServerOpts();
    expect(wow.state.hideServerSettings).toBeFalsy();
    wow.toggleServerOpts();
    expect(wow.state.hideServerSettings).toBeTruthy();
  });

  it("has a setter", () => {
    type E = React.FormEvent<HTMLInputElement>;
    const x = shallow(<TosUpdate />);
    const wow = x.instance() as TosUpdate;
    wow.setState = jest.fn();
    const fn = wow.set("email");
    fn({ currentTarget: { value: "foo@bar.com" } } as E);
    expect(wow.setState).toHaveBeenCalledWith({ email: "foo@bar.com" });
  });

  it("submits a form", () => {

  });
});
