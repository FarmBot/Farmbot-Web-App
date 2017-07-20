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
import { Wow } from "../index";
import { mount, shallow } from "enzyme";
describe("<Wow/>", () => {
  it("toggles server options", () => {
    let x = shallow(<Wow />);
    let wow = x.instance() as Wow;
    wow.toggleServerOpts();
    expect(wow.state.hideServerSettings).toBeFalsy();
    wow.toggleServerOpts();
    expect(wow.state.hideServerSettings).toBeTruthy();
  });
});
