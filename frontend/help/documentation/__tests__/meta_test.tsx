import React from "react";
import { mount } from "enzyme";
import { MetaDocsPanel } from "../meta";
import { ExternalUrl } from "../../../external_urls";

describe("<MetaDocsPanel />", () => {
  it("renders meta docs", () => {
    location.search = "";
    const wrapper = mount(<MetaDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.metaDocs);
  });
});
