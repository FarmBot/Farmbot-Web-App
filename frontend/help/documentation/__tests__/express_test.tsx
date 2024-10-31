import React from "react";
import { mount } from "enzyme";
import { ExpressDocsPanel } from "../express";
import { ExternalUrl } from "../../../external_urls";

describe("<ExpressDocsPanel />", () => {
  it("renders express docs", () => {
    location.search = "";
    const wrapper = mount(<ExpressDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.expressDocs);
  });
});
