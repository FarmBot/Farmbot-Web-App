import React from "react";
import { mount } from "enzyme";
import { SoftwareDocsPanel } from "../software";
import { ExternalUrl } from "../../../external_urls";

describe("<SoftwareDocsPanel />", () => {
  it("renders software docs", () => {
    const wrapper = mount(<SoftwareDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.softwareDocs);
  });

  it("navigates to specific doc page", () => {
    location.search = "?page=farmware";
    const wrapper = mount(<SoftwareDocsPanel />);
    expect(wrapper.find("iframe").props().src)
      .toEqual(ExternalUrl.softwareDocs + "/farmware");
  });
});
