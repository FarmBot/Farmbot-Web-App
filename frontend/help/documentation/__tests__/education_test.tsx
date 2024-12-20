import React from "react";
import { mount } from "enzyme";
import { EducationDocsPanel } from "../education";
import { ExternalUrl } from "../../../external_urls";

describe("<EducationDocsPanel />", () => {
  it("renders education docs", () => {
    location.search = "";
    const wrapper = mount(<EducationDocsPanel />);
    expect(wrapper.find("iframe").props().src).toEqual(ExternalUrl.eduDocs);
  });
});
