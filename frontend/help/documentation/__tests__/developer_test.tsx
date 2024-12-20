import React from "react";
import { mount } from "enzyme";
import { DeveloperDocsPanel } from "../developer";
import { ExternalUrl } from "../../../external_urls";

describe("<DeveloperDocsPanel />", () => {
  it("renders developer docs", () => {
    location.search = "";
    const wrapper = mount(<DeveloperDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.developerDocs);
  });
});
